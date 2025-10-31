import { Component, inject, input, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStore, User } from '../../store';
import { UsersListComponent } from './users-list.component';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, UsersListComponent, UserFormComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  protected readonly store = inject(UsersStore);
  protected readonly showForm = signal(false);
  protected readonly editingUser = signal<User | null>(null);
  protected searchQuery = '';
  protected roleFilter = '';
  protected readonly filteredUsers = signal<User[]>([]);


  ngOnInit(): void {
    this.store.loadUsers();
  }

  onShowCreateForm(): void {
    this.editingUser.set(null);
    this.showForm.set(true);
  }

  onEditUser(user: User): void {
    this.editingUser.set(user);
    this.showForm.set(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmitUser(userData: Partial<User>): void {
    const currentUser = this.editingUser();

    if (currentUser) {
      // Update existing user
      this.store.updateUser(userData as User);
    } else {
      // Create new user
      this.store.createUser(userData as Omit<User, 'id' | 'createdAt'>);
    }

    // Reset form after submission
    this.showForm.set(false);
    this.editingUser.set(null);
    this.store.clearSelection();
  }

  onCancelEdit(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
    this.store.clearSelection();
  }

  onDeleteUser(id: number): void {
    this.store.deleteUser(id);
    // If we were editing this user, close the form
    if (this.editingUser()?.id === id) {
      this.onCancelEdit();
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      const results = this.store.searchUsers(this.searchQuery);
      this.filteredUsers.set(results);
    } else if (this.roleFilter) {
      const results = this.store.getUsersByRole(this.roleFilter);
      this.filteredUsers.set(results);
    } else {
      this.filteredUsers.set([]);
    }
  }

  onFilterByRole(): void {
    if (this.roleFilter) {
      const results = this.store.getUsersByRole(this.roleFilter);
      this.filteredUsers.set(results);
    } else if (this.searchQuery.trim()) {
      this.onSearch();
    } else {
      this.filteredUsers.set([]);
    }
  }
}
