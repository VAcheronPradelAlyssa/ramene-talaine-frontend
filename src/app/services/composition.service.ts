import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompositionService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/compositions`;

  getCompositions(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(this.baseUrl);
  }
}
