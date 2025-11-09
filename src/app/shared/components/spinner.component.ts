import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() public size: 'small' | 'medium' | 'large' = 'medium';
  @Input() public color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() public message?: string;
}
