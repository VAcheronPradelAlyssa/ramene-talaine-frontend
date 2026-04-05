import { CompositionService } from '../../services/composition.service';
// Correction : une seule déclaration/export de la classe ListingDetail
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing, ListingType } from '../../models/listing.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, NgIf, JsonPipe],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.scss',
})
export class ListingDetail implements OnInit {
  listing?: Listing;
  loading = true;
  error?: string;
  listingType = ListingType;

  compositionsList: { id: number; name: string }[] = [];
  private readonly compositionService = inject(CompositionService);

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Charger la liste des compositions pour affichage des noms
    this.compositionService.getCompositions().subscribe({
      next: (data) => {
        this.compositionsList = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.compositionsList = [];
        this.cdr.detectChanges();
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.error = 'Id manquant dans l’URL';
        this.loading = false;
        return;
      }
      this.loading = true;
      this.error = undefined;
      this.listingService.getListingById(id).subscribe({
        next: (data) => {
          this.listing = data;

          // Fallback: certains endpoints détail ne renvoient pas les couleurs,
          // alors qu'elles sont présentes dans l'endpoint de liste.
          if (!this.hasColorData(data)) {
            this.hydrateColorsFromListings(id);
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Annonce introuvable ou erreur serveur.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  private hasColorData(listing: Listing | undefined): boolean {
    if (!listing) {
      return false;
    }

    if (Array.isArray(listing.colors) && listing.colors.length > 0) {
      return true;
    }

    return typeof listing.color === 'string' && listing.color.trim() !== '';
  }

  private hydrateColorsFromListings(id: string): void {
    this.listingService.getAllListings().subscribe({
      next: (listings) => {
        const fromList = listings.find((item) => String(item.id) === String(id));
        if (!fromList || !this.listing) {
          return;
        }

        const colors = Array.isArray(fromList.colors) ? fromList.colors : undefined;
        const color = fromList.color;

        if ((colors && colors.length > 0) || (typeof color === 'string' && color.trim() !== '')) {
          this.listing = {
            ...this.listing,
            colors: colors ?? this.listing.colors,
            color: (typeof color === 'string' && color.trim() !== '') ? color : this.listing.color,
          };
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Pas bloquant: on garde les données détail telles quelles.
      },
    });
  }

    compName(id: number): string {
      const found = this.compositionsList.find(c => c.id === id);
      return found ? found.name : 'Matériau #' + id;
    }
  isBrandObject(brand: any): brand is { id: number; name: string } {
    return brand && typeof brand === 'object' && 'name' in brand;
  }

  getBrandLabel(listing: Listing): string | null {
    if (listing.customBrand && listing.customBrand.trim() !== '') {
      return listing.customBrand;
    }

    if (this.isBrandObject(listing.brand)) {
      return listing.brand.name;
    }

    if (typeof listing.brand === 'string' && listing.brand.trim() !== '') {
      return listing.brand;
    }

    return null;
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
