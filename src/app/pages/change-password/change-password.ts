import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const newPwd = group.get('newPassword')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return newPwd && confirm && newPwd !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  saving = false;
  successMsg = '';
  errorMsg = '';
  showOld = false;
  showNew = false;
  showConfirm = false;

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const { oldPassword, newPassword } = this.form.value as { oldPassword: string; newPassword: string };

    this.auth.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.successMsg = 'Mot de passe modifié avec succès.';
        this.form.reset();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Mot de passe actuel incorrect ou erreur serveur.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/profile']);
  }
}
