import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../../../../shared/models';

@Component({
  selector: 'app-recent-articles-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-articles-section.component.html',
  styleUrl: './recent-articles-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentArticlesSectionComponent {
  public readonly articles = input.required<Article[]>();
  public readonly articleClick = output<Article>();
  public readonly viewAllClick = output<void>();

  protected handleArticleClick(article: Article): void {
    this.articleClick.emit(article);
  }

  protected handleViewAll(): void {
    this.viewAllClick.emit();
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
