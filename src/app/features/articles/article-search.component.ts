import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleSearchParams } from '../../services/articles.service';

@Component({
  selector: 'app-article-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-search.component.html',
  styleUrl: './article-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleSearchComponent {
  public readonly searchChange = output<ArticleSearchParams>();
  public readonly clearSearch = output<void>();

  protected readonly searchQuery = signal<string>('');

  protected onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.searchChange.emit({ query });
    }
  }

  protected onClear(): void {
    this.searchQuery.set('');
    this.clearSearch.emit();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
