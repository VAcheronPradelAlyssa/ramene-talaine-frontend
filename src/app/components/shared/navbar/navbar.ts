import { Component, OnInit } from '@angular/core';
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
  standalone: true,
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
  isMobile = false;
  mobileMenuOpen = false;
  searchBarOpen = false;
  searchQuery = '';

  currentUser: User | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }
  unreadMessagesCount = 0;
  notifications: string[] = [];
  notificationsCount = 0;
  favoritesCount = 0;

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

    // Placeholder action until a real search page exists.
    console.log('Recherche:', query);
  }

  logout(): void {
    this.currentUser = null;
    this.mobileMenuOpen = false;
    this.searchBarOpen = false;
  }
}
