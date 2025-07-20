import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Route {
  id?: number;
  name: string;
  distanceKm: number;
  geoJson: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteRecord {
  routeId: number;
  time: number; // tiempo en segundos
}

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private apiUrl = 'http://localhost:3000/api'; // Cambiar por tu URL del backend
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Crear una nueva ruta
  createRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(`${this.apiUrl}/routes`, route, this.httpOptions);
  }

  // Obtener todas las rutas del usuario
  getRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/routes`);
  }

  // Obtener rutas populares
  getPopularRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/routes/popular`);
  }

  // Actualizar una ruta
  updateRoute(id: number, route: Route): Observable<Route> {
    return this.http.put<Route>(`${this.apiUrl}/routes/${id}`, route, this.httpOptions);
  }

  // Eliminar una ruta
  deleteRoute(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/routes/${id}`);
  }

  // Registrar tiempo en una ruta
  recordTime(id: number, time: number): Observable<any> {
    const record: RouteRecord = { routeId: id, time: time };
    return this.http.post(`${this.apiUrl}/routes/${id}/record`, record, this.httpOptions);
  }
}