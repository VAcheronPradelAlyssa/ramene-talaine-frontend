import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    RouterModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isMobile = false;
  mobileMenuOpen = false;
  searchBarOpen = false;
  searchQuery = '';
  currentUser: User | null = null;
  unreadMessagesCount = 0;
  notifications: string[] = [];
  notificationsCount = 0;
  favoritesCount = 0;

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleSearchBar(): void {
    this.searchBarOpen = !this.searchBarOpen;
  }

  search(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      return;
    }
  }

  logout(): void {
    this.auth.logout();
    this.currentUser = null;
    this.mobileMenuOpen = false;
    this.searchBarOpen = false;
  }
}
