import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/routes';

  getUserRoutes() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPopularRoutes() {
    return this.http.get<any[]>(`${this.apiUrl}/popular`);
  }

  createRoute(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateRoute(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteRoute(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
