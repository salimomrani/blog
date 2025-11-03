import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  protected readonly authStore = inject(AuthStore);

  protected getRoleBadgeClass(role: 'ADMIN' | 'USER' | 'MODERATOR'): string {
    const baseClasses = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';

    switch (role) {
      case 'ADMIN':
        return `${baseClasses} text-red-700 bg-red-100`;
      case 'MODERATOR':
        return `${baseClasses} text-purple-700 bg-purple-100`;
      case 'USER':
      default:
        return `${baseClasses} text-blue-700 bg-blue-100`;
    }
  }
}
