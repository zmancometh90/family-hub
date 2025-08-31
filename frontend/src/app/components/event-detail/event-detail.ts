import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { UserDTO } from '../../models/user.model';
import { EventDTO } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetailComponent implements OnInit {
  currentUser: UserDTO | null = null;
  event: EventDTO | null = null;
  eventCreator: UserDTO | null = null;
  eventId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEvent();
    } else {
      this.errorMessage = 'Invalid event ID';
    }
  }

  loadEvent(): void {
    if (!this.eventId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        
        // Load creator information if available
        if (event.createdBy) {
          // Check if createdBy is already a user object or just an ID
          if (typeof event.createdBy === 'object' && (event.createdBy as any).name) {
            // createdBy is already a user object
            this.eventCreator = event.createdBy as UserDTO;
            this.isLoading = false;
          } else if (typeof event.createdBy === 'string') {
            // createdBy is a user ID, need to fetch user details
            this.loadEventCreator(event.createdBy);
          } else {
            this.isLoading = false;
          }
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.errorMessage = 'Error loading event details';
        this.isLoading = false;
      }
    });
  }

  loadEventCreator(creatorId: string): void {
    this.userService.getUserById(creatorId).subscribe({
      next: (user) => {
        this.eventCreator = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event creator:', error);
        // Don't show error for creator loading, just continue without it
        this.isLoading = false;
      }
    });
  }

  editEvent(): void {
    if (this.eventId) {
      this.router.navigate(['/events', this.eventId, 'edit']);
    }
  }

  deleteEvent(): void {
    if (!this.event || !this.eventId) return;

    if (confirm(`Are you sure you want to delete "${this.event.title}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.eventService.deleteEvent(this.eventId).subscribe({
        next: () => {
          this.successMessage = 'Event deleted successfully';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.errorMessage = 'Error deleting event';
          this.isLoading = false;
        }
      });
    }
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  backToDayView(): void {
    if (this.event) {
      const eventDate = new Date(this.event.startTime).toISOString().split('T')[0];
      this.router.navigate(['/day-view', eventDate]);
    } else {
      this.backToDashboard();
    }
  }

  formatDate(): string {
    if (!this.event) return '';
    
    const date = new Date(this.event.startTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(): string {
    if (!this.event) return '';
    
    const date = new Date(this.event.startTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDateTime(): string {
    if (!this.event) return '';
    
    const startDate = new Date(this.event.startTime);
    let dateTimeStr = startDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (this.event.endTime) {
      const endDate = new Date(this.event.endTime);
      const endTimeStr = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      dateTimeStr += ` - ${endTimeStr}`;
    }
    
    return dateTimeStr;
  }

  formatEventType(): string {
    if (!this.event || !this.event.eventType) return '';
    return this.event.eventType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatStatus(): string {
    if (!this.event || !this.event.status) return 'No Status';
    return this.event.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getEventColor(): string {
    if (!this.event || !this.event.eventType) return '#a0a0a0';
    
    const colorMap: { [key: string]: string } = {
      'BIRTHDAY': '#ff6b6b',
      'ANNIVERSARY': '#ff8cc8',
      'HOLIDAY': '#4ecdc4',
      'VACATION': '#45b7d1',
      'REUNION': '#f9ca24',
      'CELEBRATION': '#f0932b',
      'APPOINTMENT': '#eb4d4b',
      'MEETING': '#6c5ce7',
      'OTHER': '#a0a0a0'
    };
    return colorMap[this.event.eventType] || '#a0a0a0';
  }

  getStatusColor(): string {
    if (!this.event || !this.event.status) return '#6c757d';
    
    const colorMap: { [key: string]: string } = {
      'PLANNED': '#ffc107',
      'CONFIRMED': '#28a745',
      'IN_PROGRESS': '#17a2b8',
      'COMPLETED': '#6f42c1',
      'CANCELLED': '#dc3545',
      'POSTPONED': '#fd7e14'
    };
    return colorMap[this.event.status] || '#6c757d';
  }

  canEditEvent(): boolean {
    if (!this.event || !this.currentUser) return false;
    
    // User can edit if they created the event or if they're an admin
    return this.event.createdBy === this.currentUser.id || this.authService.isAdmin();
  }

  canDeleteEvent(): boolean {
    if (!this.event || !this.currentUser) return false;
    
    // User can delete if they created the event or if they're an admin
    return this.event.createdBy === this.currentUser.id || this.authService.isAdmin();
  }

  formatCreatedDate(): string {
    if (!this.event?.createdAt) return '';
    return new Date(this.event.createdAt).toLocaleDateString();
  }

  formatUpdatedDate(): string {
    if (!this.event?.updatedAt) return '';
    return new Date(this.event.updatedAt).toLocaleDateString();
  }

  getCreatorName(): string {
    if (this.eventCreator) {
      return this.eventCreator.name;
    }
    if (this.event?.createdBy) {
      // Handle different types of createdBy
      if (typeof this.event.createdBy === 'object' && (this.event.createdBy as any).name) {
        return (this.event.createdBy as any).name;
      } else if (typeof this.event.createdBy === 'string') {
        return this.event.createdBy; // fallback to ID string
      } else {
        return '[Object]'; // fallback for objects without name
      }
    }
    return 'Unknown';
  }

  getDynamicStatus(): string {
    if (!this.event) return 'Unknown';
    
    const now = new Date();
    const eventDate = new Date(this.event.startTime);
    const timeDiffMinutes = (eventDate.getTime() - now.getTime()) / (1000 * 60);
    
    // Event is happening now (within 30 minutes before or after event time)
    if (Math.abs(timeDiffMinutes) <= 30) {
      return 'In Progress';
    }
    // Event is coming up within the next hour
    else if (timeDiffMinutes > 0 && timeDiffMinutes <= 60) {
      return 'Upcoming';
    }
    // Event has passed
    else if (timeDiffMinutes < -30) {
      return 'Completed';
    }
    // Default to planned for future events
    else {
      return 'Planned';
    }
  }

  getDynamicStatusColor(): string {
    if (!this.event) return '#6c757d';
    
    const now = new Date();
    const eventDate = new Date(this.event.startTime);
    const timeDiffMinutes = (eventDate.getTime() - now.getTime()) / (1000 * 60);
    
    // Event is happening now (green)
    if (Math.abs(timeDiffMinutes) <= 30) {
      return '#28a745'; // Green
    }
    // Event is coming up within the next hour (yellow)
    else if (timeDiffMinutes > 0 && timeDiffMinutes <= 60) {
      return '#ffc107'; // Yellow
    }
    // Event has passed (grey)
    else if (timeDiffMinutes < -30) {
      return '#6c757d'; // Grey
    }
    // Default to blue for future planned events
    else {
      return '#007bff'; // Blue
    }
  }
}