import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroceryItemDTO, GroceryItemRequest, ApiResponse } from '../models/grocery.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GroceryService {
  private readonly API_URL = 'http://localhost:8080/api/v1/grocery';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createGroceryItem(request: GroceryItemRequest): Observable<GroceryItemDTO> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('addedByUserId', currentUser.id);
    
    return this.http.post<ApiResponse<GroceryItemDTO>>(this.API_URL, request, { headers, params })
      .pipe(map(response => response.data));
  }

  getAllGroceryItems(): Observable<GroceryItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<GroceryItemDTO[]>>(this.API_URL, { headers })
      .pipe(map(response => response.data));
  }

  getActiveGroceryItems(): Observable<GroceryItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<GroceryItemDTO[]>>(`${this.API_URL}/active`, { headers })
      .pipe(map(response => response.data));
  }

  getCompletedGroceryItems(): Observable<GroceryItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<GroceryItemDTO[]>>(`${this.API_URL}/completed`, { headers })
      .pipe(map(response => response.data));
  }

  getGroceryItemById(id: string): Observable<GroceryItemDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<GroceryItemDTO>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(response => response.data));
  }

  updateGroceryItem(id: string, request: GroceryItemRequest): Observable<GroceryItemDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<ApiResponse<GroceryItemDTO>>(`${this.API_URL}/${id}`, request, { headers })
      .pipe(map(response => response.data));
  }

  completeGroceryItem(id: string): Observable<GroceryItemDTO> {
    const headers = this.authService.getAuthHeaders();
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    
    const params = new HttpParams().set('completedByUserId', currentUser.id);
    
    return this.http.put<ApiResponse<GroceryItemDTO>>(`${this.API_URL}/${id}/complete`, null, { headers, params })
      .pipe(map(response => response.data));
  }

  uncompleteGroceryItem(id: string): Observable<GroceryItemDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<ApiResponse<GroceryItemDTO>>(`${this.API_URL}/${id}/uncomplete`, null, { headers })
      .pipe(map(response => response.data));
  }

  getGroceryCategories(): Observable<string[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/categories`, { headers })
      .pipe(map(response => response.data));
  }

  getGroceryItemsByCategory(category: string): Observable<GroceryItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<GroceryItemDTO[]>>(`${this.API_URL}/category/${category}`, { headers })
      .pipe(map(response => response.data));
  }

  searchGroceryItems(searchTerm: string): Observable<GroceryItemDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams().set('searchTerm', searchTerm);
    
    return this.http.get<ApiResponse<GroceryItemDTO[]>>(`${this.API_URL}/search`, { headers, params })
      .pipe(map(response => response.data));
  }

  deleteGroceryItem(id: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(response => response.data));
  }
}