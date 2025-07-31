import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const isValidToken = !!token && token.split('.').length === 3;

  const lastUsedAt = localStorage.getItem('lastUsedAt');
  if (lastUsedAt) {
    const diff = Date.now() - parseInt(lastUsedAt, 10);
    const minutes = diff / (1000 * 60);
    if (minutes > 60) {  // <-- Cambiado a 60 minutos
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('userId');
      return true; // Permite acceder al login o registro porque la sesión expiró
    }
  }

  if (!isValidToken) {
    return true; // Permite acceso a login/registro
  } else {
    router.navigate(['/tabs']); // Si está logueado y token válido, redirige a app principal
    return false;
  }
};


