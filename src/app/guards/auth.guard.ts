// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Validar que el token tenga la estructura de un JWT: tres partes separadas por puntos
  const isValidToken = !!token && token.split('.').length === 3;

  if (isValidToken) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
  
};
