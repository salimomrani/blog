import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  public readonly message = input('An error occurred');
  public readonly title = input<string>();
  public readonly dismissible = input(true);
  public readonly type = input<'error' | 'warning' | 'info'>('error');
  public readonly dismissed = output<void>();

  public onDismiss(): void {
    this.dismissed.emit();
  }
}
