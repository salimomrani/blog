import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '../../../store/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  protected readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  protected readonly isMobileMenuOpen = signal(false);

  // Observables for template
  protected readonly user$ = this.authFacade.user$;
  protected readonly isAuthenticated$ = this.authFacade.isAuthenticated$;
  protected readonly isAdmin$ = this.authFacade.isAdmin$;

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
    this.authFacade.logout();
    this.closeMobileMenu();
  }
}
