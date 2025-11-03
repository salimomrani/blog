import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthStore } from '../store/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.accessToken();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};


