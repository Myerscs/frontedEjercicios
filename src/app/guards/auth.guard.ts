import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const isValidToken = !!token && token.split('.').length === 3;

  // Verificar inactividad basada en lastUsedAt
  const lastUsedAt = localStorage.getItem('lastUsedAt');
  if (lastUsedAt) {
    const diff = Date.now() - parseInt(lastUsedAt, 10);
    const minutes = diff / (1000 * 60);
    if (minutes > 60) {  // <-- Aquí 60 minutos
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('userId');
      router.navigate(['/login']);
      return false;
    }
  }

  if (isValidToken) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

