import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Progress {
  id?: number;
  weightKg: number;
  bodyFat: number;
  notes: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3000/api/progress'; // Ajusta según tu URL real

  constructor(private http: HttpClient) { }

  registerProgress(progress: Progress): Observable<Progress> {
    return this.http.post<Progress>(this.apiUrl, progress);
  }

  getUserProgress(): Observable<Progress[]> {
    return this.http.get<Progress[]>(this.apiUrl);
  }

  getProgressStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getChartData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/charts`);
  }

  updateProgress(id: number, progress: Progress): Observable<Progress> {
    return this.http.put<Progress>(`${this.apiUrl}/${id}`, progress);
  }
}