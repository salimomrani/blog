import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersStore } from '../../../store/users.store';
import { AuthStore } from '../../../store/auth.store';
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
  readonly authStore = inject(AuthStore);

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
