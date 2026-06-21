import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly authBaseUrl = `${environment.API_URL}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private _currentUser = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this._currentUser.asObservable();

  setCurrentUser(user: User | null) {
    this.storeUser(user);
    this._currentUser.next(user);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authBaseUrl}/login`, { email, password })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  signup(user: User): Observable<AuthResponse> {
    const payload = {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      password: user.password,
      username: user.surnom,
      ville: user.ville,
    };

    return this.http
      .post<AuthResponse>(`${this.authBaseUrl}/register`, payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(this.userKey);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    const token = this.extractToken(response);
    if (token) {
      this.storeToken(token);
    } else {
      localStorage.removeItem(this.tokenKey);
      console.warn('Auth response did not contain a valid token');
    }

    this.setCurrentUser(this.normalizeUser(response.user ?? null));
  }

  getCurrentUser(): User | null {
    return this._currentUser.value;
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) {
      return null;
    }

    const normalized = token.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return null;
    }

    return normalized;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._currentUser.next(null);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/api/users/me`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http
      .patch<User>(`${environment.API_URL}/api/users/me`, data)
      .pipe(tap((updated) => this.setCurrentUser(this.normalizeUser(updated))));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${environment.API_URL}/api/users/me/password`, {
      oldPassword,
      newPassword,
    });
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.authBaseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.authBaseUrl}/reset-password`, { token, newPassword });
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.authBaseUrl}/verify-email`, { token });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/api/users/me`).pipe(
      tap(() => this.logout())
    );
  }

  requestProUpgrade(): Observable<User> {
    return this.http
      .post<User>(`${environment.API_URL}/api/users/me/upgrade-pro`, {})
      .pipe(tap((updated) => this.setCurrentUser(this.normalizeUser(updated))));
  }

  private extractToken(response: AuthResponse): string | null {
    const candidate = response?.token ?? response?.accessToken;
    if (typeof candidate !== 'string') {
      return null;
    }

    const normalized = candidate.trim();
    return normalized ? normalized : null;
  }

  private normalizeUser(user: User | null): User | null {
    if (!user) {
      return null;
    }

    return {
      ...user,
      surnom: user.surnom ?? user.username ?? '',
      username: user.username ?? user.surnom,
    };
  }
}
