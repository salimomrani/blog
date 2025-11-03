import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  // TODO: Add users routes when implemented
  // {
  //   path: 'users',
  //   loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
  // },
  {
    path: '**',
    redirectTo: 'home'
  }
];
