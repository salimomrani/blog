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
