import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing, ListingType } from '../../models/listing.model';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, NgFor],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.scss',
})
export class ListingDetail {
  private route = inject(ActivatedRoute);
  private listingService = inject(ListingService);

  id = this.route.snapshot.paramMap.get('id')!;
  listing$: Observable<Listing> = this.listingService.getListingById(this.id);
  listingType = ListingType;
}
