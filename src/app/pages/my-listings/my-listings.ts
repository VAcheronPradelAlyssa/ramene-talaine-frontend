import { Component, OnInit } from '@angular/core';
import { Listing } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  templateUrl: './my-listings.html',
  styleUrls: ['./my-listings.scss'],
  imports: [],
})
export class MyListings implements OnInit {
  listings: Listing[] = [];
  loading = true;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
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
}
