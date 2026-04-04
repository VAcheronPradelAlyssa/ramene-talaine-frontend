import { CompositionService } from '../../services/composition.service';
// Correction : une seule déclaration/export de la classe ListingDetail
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing, ListingType } from '../../models/listing.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, NgIf],
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
}
