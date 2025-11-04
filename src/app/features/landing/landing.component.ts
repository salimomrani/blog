import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Article } from '../../shared/models';
import { MOCK_ARTICLES } from './mocks/articles.mock';

import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { RecentArticlesSectionComponent } from './components/recent-articles-section/recent-articles-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    FeaturesSectionComponent,
    RecentArticlesSectionComponent,
    CtaSectionComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly recentArticles = signal<Article[]>([]);
  protected readonly isLoading = signal(true);


  public ngOnInit(): void {
    this.loadRecentArticles();
  }

  private loadRecentArticles(): void {
    // Simulate API call with setTimeout
    this.isLoading.set(true);

    setTimeout(() => {
      // Get 6 most recent articles
      const articles = MOCK_ARTICLES
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

      this.recentArticles.set(articles);
      this.isLoading.set(false);
    }, 500);
  }

  protected handleStartWriting(): void {
    this.router.navigate(['/articles', 'new']);
  }

  protected handleDiscoverArticles(): void {
    this.router.navigate(['/articles']);
  }

  protected handleArticleClick(article: Article): void {
    this.router.navigate(['/articles', article.id]);
  }

  protected handleViewAllArticles(): void {
    this.router.navigate(['/articles']);
  }

  protected handleSignUp(): void {
    this.router.navigate(['/auth', 'register']);
  }
}
