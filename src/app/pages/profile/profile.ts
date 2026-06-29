import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading = true;
    this.errorMsg = '';

    this.auth.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.auth.setCurrentUser(user);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Erreur lors du chargement du profil.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getInitials(user: User): string {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  }
}
