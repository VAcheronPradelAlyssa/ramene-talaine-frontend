import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);

  user: User | null = null;
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading = true;
    this.errorMsg = '';

    console.log('📡 Calling getProfile()...');

    this.auth.getProfile().subscribe({
      next: (user) => {
        console.log('✅ Profile loaded:', user);
        this.user = user;
        this.auth.setCurrentUser(user);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading profile:', error);
        this.errorMsg = error?.error?.message || 'Erreur lors du chargement du profil.';
        this.loading = false;
      },
    });
  }
}
