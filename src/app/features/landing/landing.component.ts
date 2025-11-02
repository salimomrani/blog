import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  protected readonly recentArticles = signal<Article[]>([]);
  protected readonly isLoading = signal<boolean>(true);


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
    console.log('Navigate to: /articles/new');
    // TODO: Navigate to article editor when implemented
    // this.router.navigate(['/articles', 'new']);
  }

  protected handleDiscoverArticles(): void {
    console.log('Navigate to: /articles');
    // TODO: Navigate to articles list when implemented
    // this.router.navigate(['/articles']);
  }

  protected handleArticleClick(article: Article): void {
    console.log('Navigate to article:', article.slug);
    // TODO: Navigate to article detail when implemented
    // this.router.navigate(['/articles', article.slug]);
  }

  protected handleViewAllArticles(): void {
    console.log('Navigate to: /articles');
    // TODO: Navigate to articles list when implemented
    // this.router.navigate(['/articles']);
  }

  protected handleSignUp(): void {
    console.log('Navigate to: /auth/register');
    // TODO: Navigate to registration when implemented
    // this.router.navigate(['/auth', 'register']);
  }
}
