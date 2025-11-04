import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { unauthGuard } from './guards/unauth.guard';

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
    canActivate: [unauthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'articles',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/articles/articles-list.component').then(m => m.ArticlesListComponent)
      },
      {
        path: 'new',
        canActivate: [authGuard],
        loadComponent: () => import('./features/articles/article-form.component').then(m => m.ArticleFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/articles/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [authGuard],
        loadComponent: () => import('./features/articles/article-form.component').then(m => m.ArticleFormComponent)
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
