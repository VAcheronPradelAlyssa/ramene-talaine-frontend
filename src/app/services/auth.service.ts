import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  setCurrentUser(user: User | null) {
    this._currentUser.next(user);
  }

  signup(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/signup', user);
  }
}
