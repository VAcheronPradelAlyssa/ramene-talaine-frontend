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

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
}
