import { ChangeDetectionStrategy, Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersStore } from '../../store/users.store';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly usersStore = inject(UsersStore);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['USER' as 'ADMIN' | 'USER' | 'MODERATOR', Validators.required],
    active: [true],
    password: ['']
  });

  protected isEditMode = false;
  protected userId: number | null = null;

  constructor() {
    // Effect to populate form when selectedUser changes
    effect(() => {
      const user = this.usersStore.selectedUser();
      if (user && this.isEditMode) {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          active: user.active
        });
        // Password not required for edit
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      }
    });
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = Number(id);
      this.usersStore.loadUserById(this.userId);
    } else {
      // Password required for create
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.isEditMode && this.userId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updateData } = formValue;
      this.usersStore.updateUser({ id: this.userId, user: updateData });
    } else {
      this.usersStore.createUser(formValue);
    }

    setTimeout(() => this.router.navigate(['/users']), 500);
  }
}
