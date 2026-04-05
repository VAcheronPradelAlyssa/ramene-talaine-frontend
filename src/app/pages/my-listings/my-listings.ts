import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
      },
      error: () => {
        this.listings = [];
        this.loading = false;
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
}
