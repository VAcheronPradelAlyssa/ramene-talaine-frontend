import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Subject, finalize, takeUntil, timeout } from 'rxjs';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listings',
  standalone: true,
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
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
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

    this.listingService
      .getAllListings()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading$.next(false);
        })
      )
      .subscribe({
        next: (listings: Listing[]) => {
          this.listings$.next(listings);
        },
        error: (error: unknown) => {
          const typedError = error as { name?: string; error?: { message?: string } };
          this.errorMsg$.next(
            typedError?.name === 'TimeoutError'
              ? 'Le serveur met trop de temps a repondre.'
              : typedError?.error?.message || 'Erreur lors du chargement des annonces.'
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

  getColorLabels(listing: Listing): string[] {
    const labels: string[] = [];

    if (Array.isArray(listing.colors)) {
      for (const color of listing.colors) {
        const colorData = color as any;
        const colorName = String(
          colorData?.colorName ??
          colorData?.name ??
          colorData?.label ??
          colorData?.value ??
          colorData?.color?.name ??
          colorData?.color?.label ??
          colorData?.color?.value ??
          ''
        ).trim();
        const customColor = String(
          colorData?.customColor ??
          colorData?.color?.customColor ??
          colorData?.color?.custom ??
          ''
        ).trim();

        if (colorName) {
          labels.push(colorName);
          continue;
        }

        if (customColor) {
          labels.push(customColor);
        }
      }
    }

    if (labels.length === 0) {
      const fallbackColor = typeof listing.color === 'string'
        ? listing.color.trim()
        : String((listing.color as any)?.name ?? (listing.color as any)?.label ?? (listing.color as any)?.value ?? '').trim();

      if (fallbackColor !== '') {
        labels.push(fallbackColor);
      }
    }

    return [...new Set(labels)];
  }
}
