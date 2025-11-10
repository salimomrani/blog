import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { unauthGuard } from './guards/unauth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/landing/landing/landing.component').then(m => m.LandingComponent)
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
    loadComponent: () => import('./features/profile/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'articles',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/articles/articles-list/articles-list.component').then(m => m.ArticlesListComponent)
      },
      {
        path: 'new',
        canActivate: [authGuard],
        loadComponent: () => import('./features/articles/article-form/article-form.component').then(m => m.ArticleFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/articles/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [authGuard],
        loadComponent: () => import('./features/articles/article-form/article-form.component').then(m => m.ArticleFormComponent)
      }
    ]
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'categories-tags',
        loadComponent: () => import('./features/admin/categories-tags-management/categories-tags-management.component').then(m => m.CategoriesTagsManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
