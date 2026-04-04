import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing, ListingType } from '../../models/listing.model';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.scss',
})
export class ListingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private listingService = inject(ListingService);

  id!: string;
  listing?: Listing;
  loading = true;
  error?: string;
  listingType = ListingType;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.listingService.getListingById(this.id).subscribe({
      next: (data) => {
        this.listing = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Annonce introuvable ou erreur serveur.';
        this.loading = false;
      }
    });
  }
}
