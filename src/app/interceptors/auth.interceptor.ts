import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    console.log('✓ Token found, adding Authorization header');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.log('✗ No token found');
  }

  return next(req);
};
