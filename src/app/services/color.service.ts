import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

export type ColorOption = {
  id: number | string;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class ColorService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/colors`;

  getColors(): Observable<ColorOption[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((colors) =>
        (colors || [])
          .map((c) => ({
            id: c?.id ?? c?.value ?? c?.name,
            name: c?.name ?? c?.label ?? c?.value,
          }))
          .filter((c) => c.id != null && typeof c.name === 'string' && c.name.trim() !== '')
      )
    );
  }
}
