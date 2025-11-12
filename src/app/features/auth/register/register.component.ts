import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';

/**
 * Custom validator to check if password and confirmPassword match
 */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    phone: ['']
  }, { validators: passwordMatchValidator });

  // Navigate to home only when authenticated
  readonly redirectOnAuth = effect(() => {
    if (this.authStore.isAuthenticated()) {
      this.router.navigateByUrl('/home');
    }
  });

  // Helper methods for CSS classes
  protected getInputClass(controlName: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'): string {
    const control = this.form.controls[controlName];
    const isInvalid = control.touched && control.invalid;
    const isPasswordMismatch = controlName === 'confirmPassword' && this.form.errors?.['passwordMismatch'];

    return (isInvalid || isPasswordMismatch)
      ? 'block w-full pl-10 pr-3 py-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150'
      : 'block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150';
  }

  // Helper methods for error messages
  protected getFirstNameError(): string | null {
    const control = this.form.controls.firstName;
    if (!control.touched || !control.invalid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Le prénom est requis';
    }
    if (control.errors?.['minlength']) {
      return 'Min. 2 caractères';
    }
    return null;
  }

  protected getLastNameError(): string | null {
    const control = this.form.controls.lastName;
    if (!control.touched || !control.invalid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Le nom est requis';
    }
    if (control.errors?.['minlength']) {
      return 'Min. 2 caractères';
    }
    return null;
  }

  protected getConfirmPasswordError(): string | null {
    const control = this.form.controls.confirmPassword;
    if (!control.touched || !control.invalid) {
      if (this.form.touched && this.form.errors?.['passwordMismatch']) {
        return 'Les mots de passe ne correspondent pas';
      }
      return null;
    }
    if (control.errors?.['required']) {
      return 'Confirmation requise';
    }
    return null;
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, phone } = this.form.getRawValue();
    this.authStore.register({
      firstName,
      lastName,
      email,
      password,
      phone: phone || undefined
    });
  }
}
