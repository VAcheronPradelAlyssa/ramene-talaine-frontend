import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this._currentUser.asObservable();

  setCurrentUser(user: any) {
    this._currentUser.next(user);
  }

  signup(user: User): Observable<any> {
    return this.http.post('/api/signup', user);
  }
}
