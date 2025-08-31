import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDTO, UserRequest, ApiResponse } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createUser(request: UserRequest): Observable<UserDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<ApiResponse<UserDTO>>(this.API_URL, request, { headers })
      .pipe(map(response => response.data));
  }

  getAllUsers(): Observable<UserDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<UserDTO[]>>(this.API_URL, { headers })
      .pipe(map(response => response.data));
  }

  getUserById(id: string): Observable<UserDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<UserDTO>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(response => response.data));
  }

  findUserByUsername(username: string): Observable<UserDTO> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams().set('username', username);
    return this.http.get<ApiResponse<UserDTO>>(`${this.API_URL}/search`, { headers, params })
      .pipe(map(response => response.data));
  }

  updateUser(id: string, user: UserDTO): Observable<UserDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<ApiResponse<UserDTO>>(`${this.API_URL}/${id}`, user, { headers })
      .pipe(map(response => response.data));
  }

  deleteUser(id: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(() => undefined));
  }
}