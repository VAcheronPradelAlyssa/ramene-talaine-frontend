import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Listing } from '../models/listing.model';

type ListingsApiResponse =
  | Listing[]
  | {
      content?: Listing[];
      data?: Listing[];
      items?: Listing[];
      listings?: Listing[];
    };

@Injectable({ providedIn: 'root' })
export class ListingService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/listings';

  createListing(listing: Partial<Listing>): Observable<Listing> {
    return this.http.post<Listing>(this.baseUrl, listing);
  }

  getAllListings(): Observable<Listing[]> {
    return this.http.get<ListingsApiResponse>(this.baseUrl).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }

        return response.content ?? response.data ?? response.items ?? response.listings ?? [];
      })
    );
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.baseUrl}/${id}`);
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
