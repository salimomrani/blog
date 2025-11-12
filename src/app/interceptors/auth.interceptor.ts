import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { first, switchMap } from 'rxjs/operators';
import { selectAccessToken } from '../store/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectAccessToken).pipe(
    first(),
    switchMap(token => {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
      return next(req);
    })
  );
};
