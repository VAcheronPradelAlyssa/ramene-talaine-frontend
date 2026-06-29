import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile implements OnInit {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  loading = false;
  saving = false;
  successMsg = '';
  errorMsg = '';

  ngOnInit(): void {
    this.loading = true;
    this.auth.getProfile().subscribe({
      next: (user) => {
        this.auth.setCurrentUser(user);
        this.form = this.buildForm(user);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.form = this.buildForm(this.auth.getCurrentUser());
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildForm(user: User | null): FormGroup {
    return this.fb.group({
      prenom: [user?.prenom ?? '', [Validators.required, Validators.minLength(2)]],
      nom: [user?.nom ?? '', [Validators.required, Validators.minLength(2)]],
      surnom: [user?.surnom ?? '', [Validators.required, Validators.minLength(2)]],
      ville: [user?.ville ?? ''],
      bio: [user?.bio ?? '', [Validators.maxLength(500)]],
      avatarUrl: [user?.avatarUrl ?? ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.auth.updateProfile(this.form.value).subscribe({
      next: () => {
        this.successMsg = 'Profil mis à jour avec succès.';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la mise à jour.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/profile']);
  }

  get bioLength(): number {
    return (this.form?.get('bio')?.value as string)?.length ?? 0;
  }
}
