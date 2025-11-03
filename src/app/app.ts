import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from './store/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly title = signal('blog');
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected onLogout(): void {
    this.authStore.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      }
    });
  }
}
