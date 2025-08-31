import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { UserDTO } from '../../models/user.model';
import { EventDTO } from '../../models/event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  currentUser: UserDTO | null = null;
  events: EventDTO[] = [];
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    events: []
  };

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.calendarOptions = {
          ...this.calendarOptions,
          events: events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.startTime,
            end: event.endTime,
            backgroundColor: this.getEventColor(event.eventType),
            borderColor: this.getEventColor(event.eventType),
            extendedProps: {
              description: event.description,
              location: event.location,
              eventType: event.eventType,
              status: event.status
            }
          }))
        };
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });
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

  handleDateSelect(selectInfo: DateSelectArg): void {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    // Navigate to day view for the selected date
    this.router.navigate(['/day-view', selectInfo.startStr]);
  }

  handleEventClick(clickInfo: EventClickArg): void {
    // Get the date that was clicked on (not necessarily the event's start date)
    const clickedDate = clickInfo.jsEvent.target as HTMLElement;
    const dayCell = clickedDate.closest('.fc-day, .fc-daygrid-day');
    
    if (dayCell && dayCell.getAttribute('data-date')) {
      // If we can get the clicked date, navigate to day view for that date
      const clickedDateStr = dayCell.getAttribute('data-date')!;
      this.router.navigate(['/day-view', clickedDateStr]);
    } else {
      // Fallback to event detail view
      this.router.navigate(['/events', clickInfo.event.id]);
    }
  }

  handleEvents(events: any[]): void {
    // Handle events set
  }

}