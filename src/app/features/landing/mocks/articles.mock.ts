import { Article } from '../../../shared/models';

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'getting-started-with-angular-signals',
    title: 'Getting Started with Angular Signals',
    excerpt: 'Découvrez la puissance des Signals dans Angular 17+ et comment ils révolutionnent la gestion d\'état.',
    contentMarkdown: '# Getting Started with Angular Signals\n\nLes Signals sont la nouvelle primitive réactive d\'Angular...',
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    tags: ['Angular', 'Signals', 'Frontend'],
    author: {
      id: 'user-1',
      username: 'sarah_dev',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    likes: 142,
    commentsCount: 23,
    viewsCount: 1240,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    slug: 'tailwind-css-best-practices',
    title: 'TailwindCSS Best Practices for 2025',
    excerpt: 'Les meilleures pratiques pour utiliser TailwindCSS dans vos projets modernes.',
    contentMarkdown: '# TailwindCSS Best Practices\n\nTailwind a révolutionné la façon dont nous écrivons du CSS...',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    tags: ['CSS', 'TailwindCSS', 'Design'],
    author: {
      id: 'user-2',
      username: 'alex_designer',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    likes: 89,
    commentsCount: 15,
    viewsCount: 980,
    createdAt: '2025-01-18T14:20:00Z',
    updatedAt: '2025-01-18T14:20:00Z'
  },
  {
    id: '3',
    slug: 'ngrx-signal-store-tutorial',
    title: 'NgRx Signal Store: The Future of State Management',
    excerpt: 'Apprenez à utiliser le nouveau NgRx Signal Store pour une gestion d\'état simplifiée et performante.',
    contentMarkdown: '# NgRx Signal Store Tutorial\n\nLe Signal Store de NgRx combine le meilleur des deux mondes...',
    coverImageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop',
    tags: ['NgRx', 'State Management', 'Angular'],
    author: {
      id: 'user-3',
      username: 'michael_architect',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    likes: 201,
    commentsCount: 34,
    viewsCount: 1785,
    createdAt: '2025-01-20T09:15:00Z',
    updatedAt: '2025-01-20T09:15:00Z'
  },
  {
    id: '4',
    slug: 'typescript-5-new-features',
    title: 'TypeScript 5.0: What\'s New and Exciting',
    excerpt: 'Explorez les nouvelles fonctionnalités de TypeScript 5.0 qui améliorent votre expérience de développement.',
    contentMarkdown: '# TypeScript 5.0 New Features\n\nTypeScript 5.0 apporte son lot de nouveautés...',
    coverImageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    author: {
      id: 'user-1',
      username: 'sarah_dev',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    likes: 167,
    commentsCount: 28,
    viewsCount: 1320,
    createdAt: '2025-01-22T16:45:00Z',
    updatedAt: '2025-01-22T16:45:00Z'
  },
  {
    id: '5',
    slug: 'docker-kubernetes-deployment',
    title: 'Deploying Angular Apps with Docker and Kubernetes',
    excerpt: 'Guide complet pour déployer vos applications Angular en production avec Docker et Kubernetes.',
    contentMarkdown: '# Docker & Kubernetes Deployment\n\nLe déploiement en production nécessite une stratégie solide...',
    coverImageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop',
    tags: ['Docker', 'Kubernetes', 'DevOps'],
    author: {
      id: 'user-4',
      username: 'emma_devops',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    likes: 124,
    commentsCount: 19,
    viewsCount: 1104,
    createdAt: '2025-01-25T11:00:00Z',
    updatedAt: '2025-01-25T11:00:00Z'
  },
  {
    id: '6',
    slug: 'jest-testing-angular',
    title: 'Unit Testing Angular Applications with Jest',
    excerpt: 'Maîtrisez les tests unitaires avec Jest pour des applications Angular robustes et fiables.',
    contentMarkdown: '# Jest Testing in Angular\n\nJest offre une expérience de test supérieure à Karma...',
    coverImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    tags: ['Testing', 'Jest', 'Angular'],
    author: {
      id: 'user-2',
      username: 'alex_designer',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    likes: 95,
    commentsCount: 12,
    viewsCount: 845,
    createdAt: '2025-01-28T13:30:00Z',
    updatedAt: '2025-01-28T13:30:00Z'
  }
];
