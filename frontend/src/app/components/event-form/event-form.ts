import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { EventRequest, EventType } from '../../models/event.model';
import { UserDTO } from '../../models/user.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css'
})
export class EventFormComponent implements OnInit {
  eventRequest: EventRequest = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    eventType: EventType.OTHER,
    isRecurring: false,
    recurrencePattern: '',
    createdById: '',
    attendeeIds: []
  };

  currentUser: UserDTO | null = null;
  isEditMode = false;
  eventId: string | null = null;
  isLoading = false;
  errorMessage = '';

  eventTypes = Object.values(EventType);

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Set the createdById to current user's ID
    this.eventRequest.createdById = this.currentUser.id!;

    // Check if we're in edit mode
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventId;

    // Check for pre-filled date from calendar selection
    const prefilledDate = this.route.snapshot.queryParamMap.get('date');
    if (prefilledDate) {
      this.eventRequest.startTime = this.formatDateForInput(new Date(prefilledDate));
    }

    if (this.isEditMode && this.eventId) {
      this.loadEvent();
    }
  }

  loadEvent(): void {
    if (!this.eventId) return;
    
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.eventRequest = {
          title: event.title,
          description: event.description || '',
          startTime: this.formatDateForInput(event.startTime),
          endTime: event.endTime ? this.formatDateForInput(event.endTime) : '',
          location: event.location || '',
          eventType: event.eventType,
          isRecurring: event.isRecurring,
          recurrencePattern: event.recurrencePattern || '',
          createdById: event.createdBy,
          attendeeIds: event.attendees || []
        };
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.errorMessage = 'Error loading event details';
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Convert datetime-local to ISO string (preserve local timezone)
    const eventRequest = {
      ...this.eventRequest,
      startTime: this.formatDateForBackend(this.eventRequest.startTime),
      endTime: this.eventRequest.endTime ? this.formatDateForBackend(this.eventRequest.endTime) : undefined
    };

    const request$ = this.isEditMode && this.eventId 
      ? this.eventService.updateEvent(this.eventId, eventRequest as any)
      : this.eventService.createEvent(eventRequest);

    request$.subscribe({
      next: (event) => {
        console.log('Event saved successfully:', event);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error saving event:', error);
        this.errorMessage = 'Error saving event. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.eventRequest.title.trim()) {
      this.errorMessage = 'Title is required';
      return false;
    }
    if (!this.eventRequest.startTime) {
      this.errorMessage = 'Start time is required';
      return false;
    }
    return true;
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  formatEventType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatDateForInput(dateString: string | Date): string {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    // The backend should be returning the datetime as intended (not UTC)
    // So we just need to format it for the datetime-local input
    let date: Date;
    
    if (typeof dateString === 'string') {
      // Parse the date string without timezone conversion
      // If it's in ISO format, remove the Z to avoid UTC interpretation
      const cleanDateString = dateString.replace('Z', '');
      date = new Date(cleanDateString);
    } else {
      date = dateString;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private formatDateForBackend(dateTimeLocal: string): string {
    // Convert datetime-local string to ISO string
    // datetime-local is in format: "YYYY-MM-DDTHH:mm"
    // We want to preserve the exact time the user entered
    
    // Add seconds if not present and create ISO format
    const dateWithSeconds = dateTimeLocal.includes(':') ? 
      (dateTimeLocal.split(':').length === 2 ? dateTimeLocal + ':00' : dateTimeLocal) : 
      dateTimeLocal + ':00:00';
    
    // Return as ISO string by simply appending 'Z' 
    // This tells the backend this is the intended UTC time
    return dateWithSeconds + '.000Z';
  }
}