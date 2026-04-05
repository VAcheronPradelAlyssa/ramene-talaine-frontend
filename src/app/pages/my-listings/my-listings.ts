import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Listing } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  templateUrl: './my-listings.html',
  styleUrls: ['./my-listings.scss'],
  imports: [CommonModule],
})
export class MyListings implements OnInit {
  listings: Listing[] = [];
  loading = true;
  deleting: string | null = null;
  errorMessage = '';

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.listings = [];
        this.loading = false;
        this.errorMessage = this.buildErrorMessage(error);
        console.error('Failed to load my listings', {
          status: error.status,
          message: error.message,
          backendMessage: error.error?.message,
          url: error.url,
        });
      },
    });
  }

  delete(id: string): void {
    if (!id) return;
    this.deleting = id;
    this.listingService.deleteListing(id).subscribe({
      next: () => {
        this.deleting = null;
        this.loadListings();
      },
      error: () => {
        this.deleting = null;
        // Optionnel : afficher une erreur
      },
    });
  }

  private buildErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401 || error.status === 403) {
      return 'Session invalide ou expirée. Merci de vous reconnecter.';
    }

    if (error.status === 500) {
      return 'Erreur serveur (500) lors du chargement de vos annonces.';
    }

    return error.error?.message || 'Impossible de charger vos annonces.';
  }
}
