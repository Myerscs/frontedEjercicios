// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    // catchError puede importarse de rxjs
    catchError(err => {
      if (err.status === 401) {
        router.navigate(['/']);
      }
      throw err;
    })
  );
};
