import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  public readonly text = input('');
  public readonly variant = input<'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'>('primary');
  public readonly size = input<'small' | 'medium' | 'large'>('medium');
  public readonly rounded = input(false);
}
