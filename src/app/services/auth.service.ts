import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly tokenKey = 'auth_token';
  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  setCurrentUser(user: User | null) {
    this._currentUser.next(user);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/login', { email, password })
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/register', { email, password })
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  signup(user: User): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/signup', user)
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._currentUser.next(null);
  }
}
