import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  public readonly title = input('Confirm Action');
  public readonly message = input('Are you sure you want to proceed?');
  public readonly confirmText = input('Confirm');
  public readonly cancelText = input('Cancel');
  public readonly confirmButtonType = input<'primary' | 'danger'>('primary');
  public readonly isOpen = model(false);
  public readonly confirmed = output<void>();
  public readonly cancelled = output<void>();

  public onConfirm(): void {
    this.confirmed.emit();
    this.close();
  }

  public onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  public onBackdropClick(event: MouseEvent | KeyboardEvent): void {
    if (event.target === event.currentTarget) {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') {
        return;
      }
      this.onCancel();
    }
  }

  private close(): void {
    this.isOpen.set(false);
  }
}
