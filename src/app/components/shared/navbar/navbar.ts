import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

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
export class Navbar {
  isMobile = false;
  mobileMenuOpen = false;
  searchBarOpen = false;
  searchQuery = '';

  currentUser: { name: string } | null = null;
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
