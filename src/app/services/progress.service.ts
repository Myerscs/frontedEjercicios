import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Progress {
  id?: number;
  weightKg: number;
  bodyFat: number;
  notes: string;
  createdAt?: string;
}

export interface ProgressWithTrend extends Progress {
  weightTrend?: 'up' | 'down' | 'stable';
  bodyFatTrend?: 'up' | 'down' | 'stable';
  weightChange?: number;
  bodyFatChange?: number;
  isImprovement?: boolean;
}

export interface ProgressStats {
  currentWeight: number;
  currentBodyFat: number;
  weightChange: number;
  bodyFatChange: number;
  totalWeightLoss: number;
  totalBodyFatLoss: number;
  consecutiveImprovements: number;
  isLosingWeight: boolean;
  isLosingBodyFat: boolean;
  overallTrend: 'improving' | 'stable' | 'declining';
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3000/api/progress';

  constructor(private http: HttpClient) { }

  registerProgress(progress: Progress): Observable<Progress> {
    return this.http.post<Progress>(this.apiUrl, progress);
  }

  getUserProgress(): Observable<ProgressWithTrend[]> {
    return this.http.get<Progress[]>(this.apiUrl).pipe(
      map(records => this.calculateTrends(records))
    );
  }

  getProgressStats(): Observable<ProgressStats> {
    return this.http.get<Progress[]>(this.apiUrl).pipe(
      map(records => this.calculateAdvancedStats(records))
    );
  }

  getChartData(): Observable<any> {
    return this.http.get<Progress[]>(this.apiUrl).pipe(
      map(records => {
        const sortedRecords = records.sort((a, b) => 
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
        );

        const dates = sortedRecords.map(r => new Date(r.createdAt!).toLocaleDateString());
        const weights = sortedRecords.map(r => r.weightKg);
        const bodyFats = sortedRecords.map(r => r.bodyFat);
        
        // Calcular líneas de tendencia
        const weightTrend = this.calculateTrendLine(weights);
        const bodyFatTrend = this.calculateTrendLine(bodyFats);

        return {
          dates,
          weights,
          bodyFats,
          weightTrend,
          bodyFatTrend
        };
      })
    );
  }

  updateProgress(id: number, progress: Progress): Observable<Progress> {
    return this.http.put<Progress>(`${this.apiUrl}/${id}`, progress);
  }

  deleteProgress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private calculateTrends(records: Progress[]): ProgressWithTrend[] {
    const sortedRecords = records.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    return sortedRecords.map((record, index) => {
      const progressWithTrend: ProgressWithTrend = { ...record };
      
      if (index < sortedRecords.length - 1) {
        const previousRecord = sortedRecords[index + 1];
        
        // Calcular cambios
        const weightChange = record.weightKg - previousRecord.weightKg;
        const bodyFatChange = record.bodyFat - previousRecord.bodyFat;
        
        progressWithTrend.weightChange = weightChange;
        progressWithTrend.bodyFatChange = bodyFatChange;
        
        // Determinar tendencias
        progressWithTrend.weightTrend = weightChange < -0.1 ? 'down' : 
                                       weightChange > 0.1 ? 'up' : 'stable';
        progressWithTrend.bodyFatTrend = bodyFatChange < -0.1 ? 'down' : 
                                        bodyFatChange > 0.1 ? 'up' : 'stable';
        
        // Determinar si es una mejora (pérdida de peso y/o grasa)
        progressWithTrend.isImprovement = weightChange <= 0 && bodyFatChange <= 0;
      }
      
      return progressWithTrend;
    });
  }

  private calculateAdvancedStats(records: Progress[]): ProgressStats {
    if (records.length === 0) {
      return {
        currentWeight: 0,
        currentBodyFat: 0,
        weightChange: 0,
        bodyFatChange: 0,
        totalWeightLoss: 0,
        totalBodyFatLoss: 0,
        consecutiveImprovements: 0,
        isLosingWeight: false,
        isLosingBodyFat: false,
        overallTrend: 'stable'
      };
    }

    const sortedRecords = records.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    const currentRecord = sortedRecords[0];
    const firstRecord = sortedRecords[sortedRecords.length - 1];
    
    // Calcular cambio en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recordsLast30Days = sortedRecords.filter(r => 
      new Date(r.createdAt!) >= thirtyDaysAgo
    );
    
    const thirtyDayRecord = recordsLast30Days[recordsLast30Days.length - 1];
    
    const weightChange = thirtyDayRecord ? 
      currentRecord.weightKg - thirtyDayRecord.weightKg : 0;
    const bodyFatChange = thirtyDayRecord ? 
      currentRecord.bodyFat - thirtyDayRecord.bodyFat : 0;

    // Calcular pérdida total
    const totalWeightLoss = firstRecord.weightKg - currentRecord.weightKg;
    const totalBodyFatLoss = firstRecord.bodyFat - currentRecord.bodyFat;

    // Calcular mejoras consecutivas
    let consecutiveImprovements = 0;
    for (let i = 0; i < Math.min(sortedRecords.length - 1, 5); i++) {
      const current = sortedRecords[i];
      const previous = sortedRecords[i + 1];
      
      if (current.weightKg <= previous.weightKg && current.bodyFat <= previous.bodyFat) {
        consecutiveImprovements++;
      } else {
        break;
      }
    }

    // Determinar tendencias
    const isLosingWeight = weightChange < 0 || totalWeightLoss > 0;
    const isLosingBodyFat = bodyFatChange < 0 || totalBodyFatLoss > 0;
    
    let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (isLosingWeight && isLosingBodyFat) {
      overallTrend = 'improving';
    } else if (weightChange > 0.5 || bodyFatChange > 0.5) {
      overallTrend = 'declining';
    }

    return {
      currentWeight: currentRecord.weightKg,
      currentBodyFat: currentRecord.bodyFat,
      weightChange,
      bodyFatChange,
      totalWeightLoss,
      totalBodyFatLoss,
      consecutiveImprovements,
      isLosingWeight,
      isLosingBodyFat,
      overallTrend
    };
  }

  private calculateTrendLine(values: number[]): number[] {
    if (values.length < 2) return values;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return values.map((_, i) => intercept + slope * i);
  }
}