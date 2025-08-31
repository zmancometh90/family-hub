import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginRequest, UserDTO, ApiResponse, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly API_URL = 'http://localhost:8080/api/v1';
  private credentials: string | null = null;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    const savedCredentials = localStorage.getItem('credentials');
    if (savedUser && savedCredentials) {
      this.credentials = savedCredentials;
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(loginRequest: LoginRequest): Observable<UserDTO> {
    const credentials = btoa(`${loginRequest.username}:${loginRequest.password}`);
    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<UserDTO>>(`${this.API_URL}/users/me`, { headers })
      .pipe(
        map(response => response.data),
        tap(user => {
          this.credentials = credentials;
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('credentials', credentials);
          this.currentUserSubject.next(user);
        })
      );
  }

  getAuthHeaders(): HttpHeaders {
    if (this.credentials) {
      return new HttpHeaders({
        'Authorization': `Basic ${this.credentials}`
      });
    }
    return new HttpHeaders();
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('credentials');
    this.credentials = null;
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): UserDTO | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === UserRole.ADMIN;
  }

  getUserProfile(): Observable<UserDTO> {
    return this.http.get<ApiResponse<UserDTO>>(`${this.API_URL}/users/me`)
      .pipe(
        map(response => response.data),
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }
}