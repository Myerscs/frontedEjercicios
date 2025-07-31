import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Workout {
  id?: number;
  title: string;
  description?: string;
  scheduledAt?: string;
  completed?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutFilters {
  category?: string;
  difficulty?: string;
  date?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = 'http://localhost:3000/api'; // Cambia por tu URL base

  constructor(private http: HttpClient) {}

  // Listar entrenamientos con filtros
  getWorkouts(filters?: WorkoutFilters): Observable<Workout[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
      if (filters.date) params = params.set('date', filters.date);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<Workout[]>(`${this.apiUrl}/workout`, { params });
  }

  // Crear nuevo entrenamiento
  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(`${this.apiUrl}/workout`, workout);
  }

  // Obtener entrenamiento específico
  getWorkout(id: number): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/workout/${id}`);
  }

  // Actualizar entrenamiento
  updateWorkout(id: number, workout: Partial<Workout>): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/workout/${id}`, workout);
  }

  // Eliminar entrenamiento
  deleteWorkout(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/workout/${id}`);
  }

  // Entrenamientos cercanos
  getNearbyWorkouts(latitude: number, longitude: number, radius?: number): Observable<Workout[]> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    
    if (radius) {
      params = params.set('radius', radius.toString());
    }

    return this.http.get<Workout[]>(`${this.apiUrl}/workout/nearby`, { params });
  }

  // Completar entrenamiento
  completeWorkout(id: number): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/workout/${id}/complete`, {});
  }

  // Entrenamientos programados
  getScheduledWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.apiUrl}/workout/scheduled`);
  }

  // Plantillas predefinidas (mock data - ajusta según tu backend)
  getWorkoutTemplates(): Observable<Workout[]> {
    const templates: Workout[] = [
      {
        title: 'Cardio Básico',
        description: 'Rutina de cardio para principiantes - 30 minutos'
      },
      {
        title: 'Fuerza Full Body',
        description: 'Entrenamiento completo de fuerza - 45 minutos'
      },
      {
        title: 'HIIT Intenso',
        description: 'Entrenamiento de alta intensidad - 20 minutos'
      },
      {
        title: 'Yoga Relajante',
        description: 'Sesión de yoga para flexibilidad - 60 minutos'
      }
    ];
    
    return new Observable(observer => {
      observer.next(templates);
      observer.complete();
    });
  }
}