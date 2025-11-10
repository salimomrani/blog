import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from './store/auth.store';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly title = signal('ThinkLab');
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  protected readonly isMobileMenuOpen = signal(false);

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
