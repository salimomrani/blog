import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../store';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly user = input<User | null>(null);
  readonly isSubmitting = input<boolean>(false);
  readonly submitUser = output<Partial<User>>();
  readonly cancelEdit = output<void>();

  protected userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required]
    });

    // Effect to update form when user input changes
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.userForm.patchValue({
          username: currentUser.username,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role
        });
      } else {
        this.userForm.reset();
      }
    });
  }

  protected editMode(): boolean {
    return this.user() !== null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const currentUser = this.user();

      if (currentUser) {
        // Update existing user
        this.submitUser.emit({
          ...currentUser,
          ...formValue
        });
      } else {
        // Create new user
        this.submitUser.emit(formValue);
      }
    }
  }

  onCancel(): void {
    this.userForm.reset();
    this.cancelEdit.emit();
  }
}
