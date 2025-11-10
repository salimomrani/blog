import { ChangeDetectionStrategy, Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersStore } from '../../../store/users.store';
import { AuthStore } from '../../../store/auth.store';
import { SpinnerComponent, BadgeComponent, ConfirmationDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, BadgeComponent, ConfirmationDialogComponent],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  readonly usersStore = inject(UsersStore);
  readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly showDeleteDialog = signal(false);

  /**
   * Check if admin is viewing their own profile
   */
  protected readonly isViewingSelf = computed(() => {
    const currentUser = this.authStore.user();
    const selectedUser = this.usersStore.selectedUser();
    return currentUser && selectedUser && currentUser.id === selectedUser.id;
  });

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.usersStore.loadUserById(id);
    }
  }

  protected onDeleteClick(): void {
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(): void {
    const id = this.usersStore.selectedUser()?.id;
    if (id) {
      this.usersStore.deleteUser(id);
      setTimeout(() => this.router.navigate(['/users']), 500);
    }
    this.showDeleteDialog.set(false);
  }

  protected onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
  }

  protected getRoleVariant(role: string): 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' {
    switch(role) {
      case 'ADMIN': return 'danger';
      case 'MODERATOR': return 'warning';
      case 'USER': return 'success';
      default: return 'secondary';
    }
  }
}
