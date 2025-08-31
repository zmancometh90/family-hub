export interface Event {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  eventType: EventType;
  status: EventStatus;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdBy: string;
  attendees?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventDTO {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  eventType: EventType;
  status: EventStatus;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdBy: string;
  attendees?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  eventType: EventType;
  isRecurring?: boolean;
  recurrencePattern?: string;
  createdById: string;
  attendeeIds?: string[];
}

export enum EventType {
  BIRTHDAY = 'BIRTHDAY',
  ANNIVERSARY = 'ANNIVERSARY',
  HOLIDAY = 'HOLIDAY',
  VACATION = 'VACATION',
  REUNION = 'REUNION',
  CELEBRATION = 'CELEBRATION',
  APPOINTMENT = 'APPOINTMENT',
  MEETING = 'MEETING',
  OTHER = 'OTHER'
}

export enum EventStatus {
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}