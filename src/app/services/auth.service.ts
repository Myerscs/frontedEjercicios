// src/app/services/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from '@angular/fire/auth';

const API_URL = 'http://localhost:3000/api/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token'; // usa "token" para estar alineado con login.page.ts

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: Auth = inject(Auth)
  ) {}

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.split('.').length === 3;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    this.router.navigate(['/']);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${API_URL}/login`, data);
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${API_URL}/register`, data);
  }

  loginWithGoogleFirebase() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  recoverPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  loginWithGoogleBackend(idToken: string) {
    return this.http.post(`${API_URL}/google-login`, { idToken });
  }
}
