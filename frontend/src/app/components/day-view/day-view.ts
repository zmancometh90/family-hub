import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { UserDTO } from '../../models/user.model';
import { EventDTO } from '../../models/event.model';

@Component({
  selector: 'app-day-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-view.html',
  styleUrl: './day-view.css'
})
export class DayViewComponent implements OnInit {
  currentUser: UserDTO | null = null;
  selectedDate: Date = new Date();
  events: EventDTO[] = [];
  dayEvents: EventDTO[] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  halfHours: number[] = Array.from({ length: 24 }, (_, i) => i + 0.5); // 0.5, 1.5, 2.5, etc. (midway through each hour)
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Get date from route parameters
    const dateParam = this.route.snapshot.paramMap.get('date');
    if (dateParam) {
      // Parse as local date to avoid timezone issues
      const parts = dateParam.split('-');
      if (parts.length === 3) {
        this.selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        this.selectedDate = new Date(dateParam);
      }
    }

    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.filterEventsForDay();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.errorMessage = 'Error loading events';
        this.isLoading = false;
      }
    });
  }

  filterEventsForDay(): void {
    const selectedDateStart = new Date(this.selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(this.selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);
    
    this.dayEvents = this.events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;
      
      // Event overlaps with selected day if:
      // - Event starts on or before the end of selected day AND
      // - Event ends on or after the start of selected day
      return eventStart <= selectedDateEnd && eventEnd >= selectedDateStart;
    });
  }

  getEventsForHour(hour: number): EventDTO[] {
    return this.dayEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;
      
      // Create hour boundary for the selected day
      const hourStart = new Date(this.selectedDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(this.selectedDate);
      hourEnd.setHours(hour, 59, 59, 999);
      
      // Event overlaps with this hour if:
      // - Event starts before or during this hour AND
      // - Event ends during or after this hour
      return eventStart <= hourEnd && eventEnd >= hourStart;
    });
  }

  formatHour(hour: number): string {
    return hour === 0 ? '12:00 AM' : 
           hour < 12 ? `${hour}:00 AM` :
           hour === 12 ? '12:00 PM' :
           `${hour - 12}:00 PM`;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  formatEventTimeForDay(event: EventDTO): string {
    const eventStart = new Date(event.startTime);
    const eventEnd = event.endTime ? new Date(event.endTime) : null;
    const selectedDateStart = new Date(this.selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(this.selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);
    
    // If event starts before this day
    const startsBeforeToday = eventStart < selectedDateStart;
    // If event ends after this day
    const endsAfterToday = eventEnd && eventEnd > selectedDateEnd;
    
    let timeDisplay = '';
    
    if (startsBeforeToday && endsAfterToday) {
      // Event spans entire day
      timeDisplay = 'All Day (continues)';
    } else if (startsBeforeToday && eventEnd) {
      // Event started before today, ends today
      timeDisplay = `(continues) - ${this.formatTime(eventEnd.toISOString())}`;
    } else if (endsAfterToday) {
      // Event starts today, continues after
      timeDisplay = `${this.formatTime(event.startTime)} - (continues)`;
    } else if (eventEnd && event.endTime) {
      // Normal event within the day
      timeDisplay = `${this.formatTime(event.startTime)} - ${this.formatTime(eventEnd.toISOString())}`;
    } else {
      // Event with no end time
      timeDisplay = this.formatTime(event.startTime);
    }
    
    return timeDisplay;
  }

  getEventColor(eventType: string): string {
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
    return colorMap[eventType] || '#a0a0a0';
  }

  formatEventType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(): string {
    return this.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  addEventAtHour(hour: number): void {
    const eventDateTime = new Date(this.selectedDate);
    eventDateTime.setHours(hour, 0, 0, 0);
    
    this.router.navigate(['/events/new'], {
      queryParams: {
        date: eventDateTime.toISOString()
      }
    });
  }

  viewEvent(event: EventDTO): void {
    this.router.navigate(['/events', event.id]);
  }

  backToCalendar(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToPreviousDay(): void {
    const previousDay = new Date(this.selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    this.selectedDate = previousDay;
    this.filterEventsForDay();
  }

  navigateToNextDay(): void {
    const nextDay = new Date(this.selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    this.selectedDate = nextDay;
    this.filterEventsForDay();
  }

  navigateToToday(): void {
    this.selectedDate = new Date();
    this.filterEventsForDay();
  }

  getDynamicStatusClass(event: EventDTO): string {
    const now = new Date();
    const eventDate = new Date(event.startTime);
    const timeDiffMinutes = (eventDate.getTime() - now.getTime()) / (1000 * 60);
    
    // Event is happening now (within 30 minutes before or after event time)
    if (Math.abs(timeDiffMinutes) <= 30) {
      return 'event-in-progress';
    }
    // Event is coming up within the next hour
    else if (timeDiffMinutes > 0 && timeDiffMinutes <= 60) {
      return 'event-upcoming';
    }
    // Event has passed
    else if (timeDiffMinutes < -30) {
      return 'event-completed';
    }
    // Default to planned for future events
    else {
      return 'event-planned';
    }
  }

  // Constants for layout calculations
  private readonly HOUR_HEIGHT = 60; // pixels per hour
  private readonly TIMELINE_START_HOUR = 0;
  private readonly EVENT_MIN_HEIGHT = 20;
  private readonly TIME_OFFSET = 15; // Adjustment for visual alignment (15px = 15 minutes)
  
  trackByEventId(index: number, event: EventDTO): string {
    return event.id || index.toString();
  }

  getEventTop(event: EventDTO): number {
    // Parse the date string carefully to avoid timezone issues
    let eventStart: Date;
    if (typeof event.startTime === 'string') {
      // If it's a string, parse it as local time
      eventStart = new Date(event.startTime.replace('Z', ''));
    } else {
      eventStart = new Date(event.startTime);
    }
    
    const selectedDateStart = new Date(this.selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    // If event starts before the selected day, start from beginning of day
    let displayStart = eventStart < selectedDateStart ? selectedDateStart : eventStart;
    
    const hours = displayStart.getHours();
    const minutes = displayStart.getMinutes();
    
    return (hours - this.TIMELINE_START_HOUR) * this.HOUR_HEIGHT + (minutes / 60) * this.HOUR_HEIGHT + this.TIME_OFFSET;
  }

  getEventHeight(event: EventDTO): number {
    // Parse dates carefully to avoid timezone issues
    let eventStart: Date;
    let eventEnd: Date;
    
    if (typeof event.startTime === 'string') {
      eventStart = new Date(event.startTime.replace('Z', ''));
    } else {
      eventStart = new Date(event.startTime);
    }
    
    if (event.endTime) {
      if (typeof event.endTime === 'string') {
        eventEnd = new Date(event.endTime.replace('Z', ''));
      } else {
        eventEnd = new Date(event.endTime);
      }
    } else {
      eventEnd = eventStart;
    }
    
    const selectedDateStart = new Date(this.selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(this.selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);
    
    // Calculate visible portion of event on this day
    let displayStart = eventStart < selectedDateStart ? selectedDateStart : eventStart;
    let displayEnd = eventEnd > selectedDateEnd ? selectedDateEnd : eventEnd;
    
    // If no end time, show as 1-hour block minimum
    if (!event.endTime) {
      displayEnd = new Date(displayStart.getTime() + 60 * 60 * 1000); // 1 hour
    }
    
    const durationMs = displayEnd.getTime() - displayStart.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return Math.max(this.EVENT_MIN_HEIGHT, durationHours * this.HOUR_HEIGHT);
  }

  getEventLeft(event: EventDTO): number {
    const { column, totalColumns } = this.getEventColumnInfo(event);
    const availableWidth = 280; // Total available width
    const columnWidth = availableWidth / totalColumns;
    return column * columnWidth;
  }

  getEventWidth(event: EventDTO): number {
    const { totalColumns } = this.getEventColumnInfo(event);
    const availableWidth = 280; // Total available width
    const columnWidth = availableWidth / totalColumns;
    return columnWidth - 2; // Small gap between events
  }

  private getEventColumnInfo(event: EventDTO): { column: number, totalColumns: number } {
    const overlappingEvents = this.getOverlappingEvents(event);
    const totalColumns = overlappingEvents.length;
    const column = overlappingEvents.findIndex(e => e.id === event.id);
    
    return { column, totalColumns };
  }

  private getOverlappingEvents(targetEvent: EventDTO): EventDTO[] {
    const targetStart = new Date(targetEvent.startTime);
    const targetEnd = targetEvent.endTime ? new Date(targetEvent.endTime) : targetStart;
    
    const selectedDateStart = new Date(this.selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(this.selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);
    
    // Calculate visible portion for target event
    let targetDisplayStart = targetStart < selectedDateStart ? selectedDateStart : targetStart;
    let targetDisplayEnd = targetEnd > selectedDateEnd ? selectedDateEnd : targetEnd;
    
    const overlapping = this.dayEvents.filter(event => {
      if (event.id === targetEvent.id) return true; // Include self
      
      const eventStart = new Date(event.startTime);
      const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;
      
      // Calculate visible portion for this event
      let displayStart = eventStart < selectedDateStart ? selectedDateStart : eventStart;
      let displayEnd = eventEnd > selectedDateEnd ? selectedDateEnd : eventEnd;
      
      // Check if events overlap in time
      return displayStart < targetDisplayEnd && displayEnd > targetDisplayStart;
    });
    
    // Sort by start time, then by id for consistent ordering
    return overlapping.sort((a, b) => {
      const aStart = new Date(a.startTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return (a.id || '').localeCompare(b.id || '');
    });
  }


  getCurrentTimeTop(): number {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * this.HOUR_HEIGHT + (minutes / 60) * this.HOUR_HEIGHT;
  }

  isToday(): boolean {
    const today = new Date();
    const selectedDate = this.selectedDate;
    
    return today.getFullYear() === selectedDate.getFullYear() &&
           today.getMonth() === selectedDate.getMonth() &&
           today.getDate() === selectedDate.getDate();
  }

  getHalfHourLineTop(hour: number): number {
    // Position at exactly 30 minutes (middle) of each hour
    // No TIME_OFFSET needed since the grid container already has it
    return hour * this.HOUR_HEIGHT + (this.HOUR_HEIGHT / 2);
  }
}