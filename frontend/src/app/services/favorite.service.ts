import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FavoriteItemDTO, FavoriteItemRequest, ApiResponse } from '../models/grocery.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly API_URL = 'http://localhost:8080/api/v1/favorites';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createFavoriteItem(request: FavoriteItemRequest): Observable<FavoriteItemDTO> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('userId', currentUser.id);
    
    return this.http.post<ApiResponse<FavoriteItemDTO>>(this.API_URL, request, { headers, params })
      .pipe(map(response => response.data));
  }

  getUserFavoriteItems(): Observable<FavoriteItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    return this.http.get<ApiResponse<FavoriteItemDTO[]>>(`${this.API_URL}/user/${currentUser.id}`, { headers })
      .pipe(map(response => response.data));
  }

  getFavoriteItemById(id: string): Observable<FavoriteItemDTO> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('userId', currentUser.id);
    
    return this.http.get<ApiResponse<FavoriteItemDTO>>(`${this.API_URL}/${id}`, { headers, params })
      .pipe(map(response => response.data));
  }

  updateFavoriteItem(id: string, request: FavoriteItemRequest): Observable<FavoriteItemDTO> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('userId', currentUser.id);
    
    return this.http.put<ApiResponse<FavoriteItemDTO>>(`${this.API_URL}/${id}`, request, { headers, params })
      .pipe(map(response => response.data));
  }

  getUserFavoriteCategories(): Observable<string[]> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/user/${currentUser.id}/categories`, { headers })
      .pipe(map(response => response.data));
  }

  getUserFavoriteItemsByCategory(category: string): Observable<FavoriteItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    return this.http.get<ApiResponse<FavoriteItemDTO[]>>(`${this.API_URL}/user/${currentUser.id}/category/${category}`, { headers })
      .pipe(map(response => response.data));
  }

  searchUserFavoriteItems(searchTerm: string): Observable<FavoriteItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('searchTerm', searchTerm);
    
    return this.http.get<ApiResponse<FavoriteItemDTO[]>>(`${this.API_URL}/user/${currentUser.id}/search`, { headers, params })
      .pipe(map(response => response.data));
  }

  deleteFavoriteItem(id: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('userId', currentUser.id);
    
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, { headers, params })
      .pipe(map(response => response.data));
  }
}