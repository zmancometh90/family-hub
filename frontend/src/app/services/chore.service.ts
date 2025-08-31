import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChoreDTO, ChoreRequest } from '../models/chore.model';
import { ApiResponse } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChoreService {
  private readonly API_URL = 'http://localhost:8080/api/v1/chores';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllChores(): Observable<ChoreDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<ChoreDTO[]>>(this.API_URL, { headers })
      .pipe(map(response => response.data || []));
  }

  getChoreById(id: string): Observable<ChoreDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<ChoreDTO>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(response => response.data!));
  }

  createChore(chore: ChoreRequest): Observable<ChoreDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<ApiResponse<ChoreDTO>>(this.API_URL, chore, { headers })
      .pipe(map(response => response.data!));
  }

  updateChore(id: string, chore: ChoreRequest): Observable<ChoreDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<ApiResponse<ChoreDTO>>(`${this.API_URL}/${id}`, chore, { headers })
      .pipe(map(response => response.data!));
  }

  deleteChore(id: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(() => void 0));
  }

  updateChoreStatus(id: string, status: string): Observable<ChoreDTO> {
    const headers = this.authService.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.put<ApiResponse<ChoreDTO>>(`${this.API_URL}/${id}/status`, status, { headers })
      .pipe(map(response => response.data!));
  }

  getChoresByAssignedUser(userId: string): Observable<ChoreDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<ChoreDTO[]>>(`${this.API_URL}/assigned/${userId}`, { headers })
      .pipe(map(response => response.data || []));
  }

  getChoresByStatus(status: string): Observable<ChoreDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<ChoreDTO[]>>(`${this.API_URL}/status/${status}`, { headers })
      .pipe(map(response => response.data || []));
  }

  getOverdueChores(): Observable<ChoreDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<ChoreDTO[]>>(`${this.API_URL}/overdue`, { headers })
      .pipe(map(response => response.data || []));
  }

  getChoresByDateRange(startDate: string, endDate: string): Observable<ChoreDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<ChoreDTO[]>>(`${this.API_URL}/date-range`, {
      params: { startDate, endDate },
      headers
    }).pipe(map(response => response.data || []));
  }
}