import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersStore } from '../../store/users.store';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  readonly usersStore = inject(UsersStore);
  readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.usersStore.loadUserById(id);
    }
  }

  protected onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const id = this.usersStore.selectedUser()?.id;
      if (id) {
        this.usersStore.deleteUser(id);
        setTimeout(() => this.router.navigate(['/users']), 500);
      }
    }
  }
}
