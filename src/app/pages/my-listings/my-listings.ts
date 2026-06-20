import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';
import { getColorLabels } from '../../utils/color.utils';

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.html',
  styleUrls: ['./my-listings.scss'],
  imports: [CommonModule, RouterModule],
})
export class MyListings implements OnInit {
  private listingService = inject(ListingService);

  listings: Listing[] = [];
  loading = true;
  deleting: string | null = null;
  errorMessage = '';

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
      },
    });
  }

  delete(id: string, title?: string): void {
    if (!id) return;

    const listingLabel = title?.trim() ? `"${title.trim()}"` : 'cette annonce';
    if (!window.confirm(`Confirmer la suppression de ${listingLabel} ?`)) {
      return;
    }

    this.deleting = id;
    this.listingService.deleteListing(id).subscribe({
      next: () => {
        this.deleting = null;
        this.loadListings();
      },
      error: () => {
        this.deleting = null;
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

  getImageUrl(listing: Listing): string {
    return listing.imageUrls?.[0] || 'assets/logo/Ramene-ta-laine.png';
  }

  getTypeLabel(listing: Listing): string {
    if (listing.type === ListingType.FREE) return 'Don';
    if (listing.type === ListingType.EXCHANGE) return 'Echange';
    return `${listing.price ?? 0} EUR`;
  }

  getColorLabels(listing: Listing): string[] {
    return getColorLabels(listing);
  }
}
