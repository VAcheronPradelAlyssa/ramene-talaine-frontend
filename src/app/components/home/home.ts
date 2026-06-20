import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private router = inject(Router);

  searchQuery = '';
  isLoggedIn = false;

  search(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    // TODO: this.router.navigate(['/search'], { queryParams: { q } });
  }

  goToCategory(category: string): void {
    // TODO: this.router.navigate(['/categories', category]);
  }

  goToRegister(): void {
    void this.router.navigate(['/inscription']);
  }
}
