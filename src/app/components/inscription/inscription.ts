import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, NgModel, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthResponse, User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {

  formData: User = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    surnom: '',
    ville: ''
  };

  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.successMsg = '';
      this.errorMsg = '';
      this.auth.signup(this.formData).subscribe({
        next: (response: AuthResponse) => {
          this.successMsg = 'Inscription réussie !';
          this.loading = false;
          this.auth.setCurrentUser(response.user ?? this.formData);
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.message || 'Erreur lors de l\'inscription.';
          this.loading = false;
        }
      });
    }
  }
}
