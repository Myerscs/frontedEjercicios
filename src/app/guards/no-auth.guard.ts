// src/app/guards/no-auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const isValidToken = !!token && token.split('.').length === 3;

  if (!isValidToken) {
    return true;
  } else {
    router.navigate(['/tabs']);
    return false;
  }
};

