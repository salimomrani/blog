import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor to handle 403 Forbidden responses
 * Redirects to home page when user lacks permissions
 */
export const forbiddenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        // User is authenticated but lacks permissions
        // Redirect to home page with error message
        router.navigate(['/home'], {
          queryParams: {
            error: 'access-denied',
            message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource'
          }
        });
      }

      return throwError(() => error);
    })
  );
};
