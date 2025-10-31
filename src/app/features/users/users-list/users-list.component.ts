import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersStore, User } from '../../../store';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  providers: [UsersStore],
})
export class UsersListComponent {
  protected readonly store = inject(UsersStore);

  readonly editUser = output<User>();
  readonly deleteUser = output<number>();

  onEdit(user: User): void {
    this.store.selectUser(user.id);
    this.editUser.emit(user);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.deleteUser.emit(id);
    }
  }
}
