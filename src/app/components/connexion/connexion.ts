import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-connexion',
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.html',
  styleUrl: './connexion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  onSubmit(form: NgForm): void {
    if (!form.valid || this.loading) {
      return;
    }

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        this.auth.setCurrentUser(response.user ?? null);
        this.successMsg = 'Connexion réussie.';
        this.loading = false;
        void this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Erreur lors de la connexion.';
        this.loading = false;
      },
    });
  }
}
