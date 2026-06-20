import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { AuthResponse, User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  imports: [CommonModule, FormsModule],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  private auth = inject(AuthService);
  private router = inject(Router);

  formData: User = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    surnom: '',
    ville: '',
  };

  loading = false;
  successMsg = '';
  errorMsg = '';
  emailErrorMsg = '';
  surnomErrorMsg = '';
  surnomSuggestion: string | null = null;

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.emailErrorMsg = '';
    this.surnomErrorMsg = '';
    this.surnomSuggestion = null;

    this.auth.signup(this.formData).subscribe({
      next: (response: AuthResponse) => {
        this.successMsg = 'Inscription réussie !';
        this.loading = false;
        if (response.token) {
          this.auth.storeToken(response.token);
        }
        this.auth.setCurrentUser(response.user ?? this.formData);
        void this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading = false;
        const error = err?.error;
        if (error) {
          if (error.field === 'email') {
            this.emailErrorMsg = error.message || 'Email déjà utilisé ou invalide.';
          } else if (error.field === 'surnom' || error.field === 'username') {
            this.surnomErrorMsg = error.message || 'Surnom déjà utilisé.';
            if (error.suggestion) {
              this.surnomSuggestion = error.suggestion;
            }
          } else {
            this.errorMsg = error.message || "Erreur lors de l'inscription.";
          }
        } else {
          this.errorMsg = "Erreur lors de l'inscription.";
        }
      },
    });
  }

  utiliserSuggestionSurnom(): void {
    if (this.surnomSuggestion) {
      this.formData.surnom = this.surnomSuggestion;
      this.surnomSuggestion = null;
    }
  }
}
