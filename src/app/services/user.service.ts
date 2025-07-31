import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`, {
      headers: this.getHeaders()
    });
  }

  updateUser(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user`, userData, {
      headers: this.getHeaders()
    });
  }
}