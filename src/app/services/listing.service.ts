import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/listings';

  createListing(listing: Listing): Observable<Listing> {
    return this.http.post<Listing>(this.baseUrl, listing);
  }

  getAllListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(this.baseUrl);
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.baseUrl}/${id}`);
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
