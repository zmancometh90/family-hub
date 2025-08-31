import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventDTO, EventRequest, EventType, EventStatus } from '../models/event.model';
import { ApiResponse } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:8080/api/v1/events';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createEvent(request: EventRequest): Observable<EventDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<ApiResponse<EventDTO>>(this.API_URL, request, { headers })
      .pipe(map(response => response.data));
  }

  getAllEvents(): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<EventDTO[]>>(this.API_URL, { headers })
      .pipe(map(response => response.data));
  }

  getEventById(id: string): Observable<EventDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<EventDTO>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(response => response.data));
  }

  getEventsByDateRange(start: Date, end: Date): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    
    return this.http.get<ApiResponse<EventDTO[]>>(`${this.API_URL}/date-range`, { headers, params })
      .pipe(map(response => response.data));
  }

  getEventsByUser(userId: string): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<EventDTO[]>>(`${this.API_URL}/user/${userId}`, { headers })
      .pipe(map(response => response.data));
  }

  getEventsByUserAndDateRange(userId: string, start: Date, end: Date): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    
    return this.http.get<ApiResponse<EventDTO[]>>(`${this.API_URL}/user/${userId}/date-range`, { headers, params })
      .pipe(map(response => response.data));
  }

  getEventsByType(eventType: EventType): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<EventDTO[]>>(`${this.API_URL}/type/${eventType}`, { headers })
      .pipe(map(response => response.data));
  }

  getEventsByStatus(status: EventStatus): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ApiResponse<EventDTO[]>>(`${this.API_URL}/status/${status}`, { headers })
      .pipe(map(response => response.data));
  }

  searchEvents(query: string): Observable<EventDTO[]> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<EventDTO[]>>(`${this.API_URL}/search`, { headers, params })
      .pipe(map(response => response.data));
  }

  updateEvent(id: string, event: EventDTO): Observable<EventDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<ApiResponse<EventDTO>>(`${this.API_URL}/${id}`, event, { headers })
      .pipe(map(response => response.data));
  }

  deleteEvent(id: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, { headers })
      .pipe(map(() => undefined));
  }

  addAttendee(eventId: string, userId: string): Observable<EventDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<ApiResponse<EventDTO>>(`${this.API_URL}/${eventId}/attendees/${userId}`, {}, { headers })
      .pipe(map(response => response.data));
  }

  removeAttendee(eventId: string, userId: string): Observable<EventDTO> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<ApiResponse<EventDTO>>(`${this.API_URL}/${eventId}/attendees/${userId}`, { headers })
      .pipe(map(response => response.data));
  }
}