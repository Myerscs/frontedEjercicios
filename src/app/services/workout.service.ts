import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = 'http://localhost:3000/api/workout'; // Ajusta la URL según tu API

  constructor(private http: HttpClient) {}

  // Obtener todos los entrenamientos
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener entrenamiento por ID
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo entrenamiento
  create(workout: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, workout);
  }

  // Actualizar entrenamiento
  update(id: string, workout: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, workout);
  }

  // Eliminar entrenamiento
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Marcar entrenamiento como completado
  markComplete(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/complete`, {});
  }

  // Obtener entrenamientos cercanos (opcional)
  getNearby(latitude: number, longitude: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nearby?lat=${latitude}&lng=${longitude}`);
  }

  // Obtener entrenamientos programados (opcional)
  getScheduled(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/scheduled`);
  }
}