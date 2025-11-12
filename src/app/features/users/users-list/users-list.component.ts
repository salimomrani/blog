import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersStore } from '../../../store/users.store';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { SpinnerComponent, ErrorMessageComponent, BadgeComponent } from '../../../shared/components';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SpinnerComponent, ErrorMessageComponent, BadgeComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnInit {
  readonly usersStore = inject(UsersStore);
  readonly authFacade = inject(AuthFacade);

  // Signal version of auth state (converted from observable)
  readonly isAuthenticated = toSignal(this.authFacade.isAuthenticated$, { initialValue: false });

  public ngOnInit(): void {
    this.usersStore.loadUsers();
  }

  protected onSearchChange(query: string): void {
    this.usersStore.setSearchQuery(query);
  }

  protected onRoleFilterChange(role: string): void {
    this.usersStore.setRoleFilter(role as 'ALL' | 'ADMIN' | 'USER' | 'MODERATOR');
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
