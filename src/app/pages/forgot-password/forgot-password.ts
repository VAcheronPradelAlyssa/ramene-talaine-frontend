import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  sending = false;
  sent = false;
  errorMsg = '';

  onSubmit(): void {
    if (this.form.invalid || this.sending) return;
    this.sending = true;
    this.errorMsg = '';

    const email = this.form.get('email')?.value as string;

    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.sent = true;
        this.sending = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de l\'envoi. Vérifiez votre adresse email.';
        this.sending = false;
      },
    });
  }
}
