import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/brands`;

  getBrands(): Observable<string[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((brands) => (brands || []).map(b => b.name))
    );
  }
}
