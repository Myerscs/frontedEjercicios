import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Progress {
  id?: number;
  userId?: number;
  activity: string;
  duration: number;
  date: string;
  notes?: string;
  caloriesBurned?: number;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressStats {
  totalActivities: number;
  totalDuration: number;
  totalCalories: number;
  averageWeight: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  getAll() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000/api/progress'; // Cambia por tu URL base
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Registrar progreso
  createProgress(progress: Progress): Observable<Progress> {
    return this.http.post<Progress>(this.apiUrl, progress, this.httpOptions);
  }

  // Obtener progreso del usuario
  getProgress(): Observable<Progress[]> {
    return this.http.get<Progress[]>(this.apiUrl);
  }

  // Obtener estadísticas de progreso
  getProgressStats(): Observable<ProgressStats> {
    return this.http.get<ProgressStats>(`${this.apiUrl}/stats`);
  }

  // Obtener datos para gráficos
  getChartData(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/charts`);
  }

  // Actualizar registro de progreso
  updateProgress(id: number, progress: Progress): Observable<Progress> {
    return this.http.put<Progress>(`${this.apiUrl}/${id}`, progress, this.httpOptions);
  }

  // Método auxiliar para manejar errores
  private handleError(error: any): Observable<never> {
    console.error('Error en ProgressService:', error);
    throw error;
  }
}