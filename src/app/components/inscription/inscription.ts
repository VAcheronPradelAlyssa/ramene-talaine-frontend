import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, NgModel, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
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
        next: () => {
          this.successMsg = 'Inscription réussie !';
          this.loading = false;
          // Redirection possible après succès :
          // this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Erreur lors de l\'inscription.';
          this.loading = false;
        }
      });
    }
  }
}
