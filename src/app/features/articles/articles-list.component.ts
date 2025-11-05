import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesStore } from '../../store/articles.store';
import { AuthStore } from '../../store/auth.store';
import { IsAuthorPipe } from '../../shared/pipes/is-author.pipe';
import { TextExcerptPipe } from '../../shared/pipes/text-excerpt.pipe';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, RouterLink, IsAuthorPipe, TextExcerptPipe],
  templateUrl: './articles-list.component.html',
  styleUrl: './articles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlesListComponent implements OnInit {
  readonly articlesStore = inject(ArticlesStore);
  readonly authStore = inject(AuthStore);

  public ngOnInit(): void {
    this.articlesStore.loadArticles();
  }
}
