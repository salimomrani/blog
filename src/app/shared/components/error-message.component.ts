import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  @Input() public message: string = 'An error occurred';
  @Input() public title?: string;
  @Input() public dismissible: boolean = true;
  @Input() public type: 'error' | 'warning' | 'info' = 'error';
  @Output() public dismissed = new EventEmitter<void>();

  public onDismiss(): void {
    this.dismissed.emit();
  }
}
