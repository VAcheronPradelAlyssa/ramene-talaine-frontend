import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { finalize, timeout } from 'rxjs';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listings',
  imports: [CommonModule],
  templateUrl: './listings.html',
  styleUrl: './listings.scss',
})
export class Listings implements OnInit {
  private readonly listingService = inject(ListingService);

  listings: Listing[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.loadListings();
  }

  private loadListings(): void {
    this.loading = true;
    this.errorMsg = '';

    this.listingService.getAllListings().pipe(
      timeout(10000),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (listings) => {
        this.listings = listings;
      },
      error: (error) => {
        this.errorMsg = error?.name === 'TimeoutError'
          ? 'Le serveur met trop de temps a repondre.'
          : (error?.error?.message || 'Erreur lors du chargement des annonces.');
      },
    });
  }

  getImageUrl(listing: Listing): string {
    return listing.imageUrls?.[0] || 'assets/logo/Ramene-ta-laine.png';
  }

  getTypeLabel(listing: Listing): string {
    if (listing.type === ListingType.FREE) {
      return 'Don';
    }

    if (listing.type === ListingType.EXCHANGE) {
      return 'Echange';
    }

    return `${listing.price ?? 0} EUR`;
  }
}
