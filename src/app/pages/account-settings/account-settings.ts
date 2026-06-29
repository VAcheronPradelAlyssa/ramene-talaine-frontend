import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule, RouterModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss',
})
export class AccountSettings implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  proLoading = false;
  proSuccessMsg = '';
  proErrorMsg = '';

  deleteStep: 'idle' | 'confirm' | 'deleting' = 'idle';
  deleteErrorMsg = '';

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.auth.currentUser$.subscribe((u) => (this.user = u));
  }

  get isPro(): boolean {
    return this.user?.accountType === 'PRO';
  }

  requestPro(): void {
    if (this.proLoading) return;
    this.proLoading = true;
    this.proSuccessMsg = '';
    this.proErrorMsg = '';

    this.auth.requestProUpgrade().subscribe({
      next: (updated) => {
        this.user = updated;
        this.proSuccessMsg = 'Votre demande de compte Pro a été envoyée. Vous serez notifié par email.';
        this.proLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.proErrorMsg = err?.error?.message || 'Erreur lors de la demande. Réessayez plus tard.';
        this.proLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  startDelete(): void {
    this.deleteStep = 'confirm';
    this.deleteErrorMsg = '';
  }

  cancelDelete(): void {
    this.deleteStep = 'idle';
    this.deleteErrorMsg = '';
  }

  confirmDelete(): void {
    this.deleteStep = 'deleting';
    this.deleteErrorMsg = '';

    this.auth.deleteAccount().subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: (err) => {
        this.deleteErrorMsg = err?.error?.message || 'Erreur lors de la suppression. Réessayez.';
        this.deleteStep = 'confirm';
        this.cdr.detectChanges();
      },
    });
  }
}
