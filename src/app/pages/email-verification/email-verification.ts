import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-verification',
  imports: [CommonModule, RouterModule],
  templateUrl: './email-verification.html',
  styleUrl: './email-verification.scss',
})
export class EmailVerification implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  state: 'loading' | 'success' | 'error' | 'missing' = 'loading';

  ngOnInit(): void {
    const token = (this.route.snapshot.queryParamMap.get('token') ?? '').trim();

    if (!token) {
      this.state = 'missing';
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: () => { this.state = 'success'; },
      error: () => { this.state = 'error'; },
    });
  }
}
