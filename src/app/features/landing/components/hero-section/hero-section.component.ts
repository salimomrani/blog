import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSectionComponent {
  public readonly startWriting = output<void>();
  public readonly discoverArticles = output<void>();

  protected handleStartWriting(): void {
    this.startWriting.emit();
  }

  protected handleDiscoverArticles(): void {
    this.discoverArticles.emit();
  }
}
