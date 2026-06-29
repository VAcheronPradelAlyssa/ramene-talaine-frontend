import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const pwd = group.get('newPassword')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return pwd && confirm && pwd !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  token = '';
  tokenMissing = false;

  form: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  saving = false;
  done = false;
  errorMsg = '';
  showNew = false;
  showConfirm = false;

  ngOnInit(): void {
    this.token = (this.route.snapshot.queryParamMap.get('token') ?? '').trim();
    if (!this.token) {
      this.tokenMissing = true;
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving || this.tokenMissing) return;
    this.saving = true;
    this.errorMsg = '';

    const { newPassword } = this.form.value as { newPassword: string };

    this.auth.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.done = true;
        this.saving = false;
        this.cdr.detectChanges();
        setTimeout(() => void this.router.navigate(['/connexion']), 3000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Le lien est invalide ou a expiré.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
