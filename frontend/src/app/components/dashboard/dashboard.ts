import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
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
  currentView: 'month' | 'day' | 'myday' = 'month';
  selectedDate: Date = new Date();
  todayEvents: EventDTO[] = [];
  userEvents: EventDTO[] = [];
  calendarApi: any = null;
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridDay,myDayView'
    },
    customButtons: {
      myDayView: {
        text: 'My Day',
        click: () => this.switchView('myday')
      }
    },
    views: {
      dayGridMonth: {
        buttonText: 'Month'
      },
      timeGridDay: {
        buttonText: 'Daily'
      }
    },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    allDaySlot: true,
    nowIndicator: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    viewDidMount: this.handleViewChange.bind(this),
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

    // Switch to daily view for the selected date
    calendarApi.changeView('timeGridDay', selectInfo.start);
    this.currentView = 'day';
  }

  handleEventClick(clickInfo: EventClickArg): void {
    // Switch to daily view for the event's date
    const calendarApi = clickInfo.view.calendar;
    if (clickInfo.event.start) {
      calendarApi.changeView('timeGridDay', clickInfo.event.start);
      this.currentView = 'day';
    }
  }

  handleEvents(events: any[]): void {
    // Handle events set
  }

  switchView(view: 'month' | 'day' | 'myday'): void {
    this.currentView = view;
    if (view === 'myday') {
      this.filterUserEvents();
    } else if (this.calendarApi) {
      // For regular calendar views, let FullCalendar handle the view change
      if (view === 'month') {
        this.calendarApi.changeView('dayGridMonth');
      } else if (view === 'day') {
        this.calendarApi.changeView('timeGridDay');
      }
    }
  }

  handleViewChange(viewInfo: any): void {
    // Store calendar API reference
    this.calendarApi = viewInfo.view.calendar;
    
    // Update current view based on FullCalendar view
    if (viewInfo.view.type === 'dayGridMonth') {
      this.currentView = 'month';
    } else if (viewInfo.view.type === 'timeGridDay') {
      this.currentView = 'day';
    }
  }

  filterTodayEvents(): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    this.todayEvents = this.events.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0];
      return eventDate === todayStr;
    });
  }

  filterUserEvents(): void {
    if (!this.currentUser) return;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Filter events for current user for today
    this.userEvents = this.events.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0];
      // In a real app, you'd filter by event.userId === this.currentUser.id
      // For now, we'll show all events for the day
      return eventDate === todayStr;
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatEventType(eventType: string): string {
    return eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase().replace('_', ' ');
  }

}