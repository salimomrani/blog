import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  protected readonly isMobileMenuOpen = signal(false);

  public ngOnInit(): void {
    // Close mobile menu on route change
    this.router.events.subscribe(() => {
      this.closeMobileMenu();
    });
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected onLogout(): void {
    this.authStore.logout().subscribe({
      next: () => {
        this.closeMobileMenu();
        this.router.navigate(['/home']);
      }
    });
  }
}
