import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  @Input() public title: string = 'Confirm Action';
  @Input() public message: string = 'Are you sure you want to proceed?';
  @Input() public confirmText: string = 'Confirm';
  @Input() public cancelText: string = 'Cancel';
  @Input() public confirmButtonType: 'primary' | 'danger' = 'primary';
  @Input() public isOpen: boolean = false;
  @Output() public confirmed = new EventEmitter<void>();
  @Output() public cancelled = new EventEmitter<void>();
  @Output() public isOpenChange = new EventEmitter<boolean>();

  public onConfirm(): void {
    this.confirmed.emit();
    this.close();
  }

  public onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  public onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  private close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
