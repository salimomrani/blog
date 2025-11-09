import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  public readonly size = input<'small' | 'medium' | 'large'>('medium');
  public readonly color = input<'primary' | 'secondary' | 'white'>('primary');
  public readonly message = input<string>();
}
