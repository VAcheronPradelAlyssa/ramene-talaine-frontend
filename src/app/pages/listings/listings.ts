import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { BehaviorSubject, finalize, timeout, takeUntil, Subject } from 'rxjs';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';


@Component({
  selector: 'app-listings',
  imports: [CommonModule, RouterModule],
  templateUrl: './listings.html',
  styleUrl: './listings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Listings implements OnInit {
  private readonly listingService = inject(ListingService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  listings$ = new BehaviorSubject<Listing[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  errorMsg$ = new BehaviorSubject<string>('');

  ngOnInit(): void {
    this.loadListings();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects.includes('/listings')) {
        this.loadListings();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadListings(): void {
    this.loading$.next(true);
    this.errorMsg$.next('');

    this.listingService.getAllListings().pipe(
      timeout(10000),
      finalize(() => {
        this.loading$.next(false);
      })
    ).subscribe({
      next: (listings) => {
        this.listings$.next(listings);
      },
      error: (error) => {
        this.errorMsg$.next(
          error?.name === 'TimeoutError'
            ? 'Le serveur met trop de temps a repondre.'
            : (error?.error?.message || 'Erreur lors du chargement des annonces.')
        );
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
