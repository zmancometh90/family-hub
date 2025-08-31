import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { EventFormComponent } from './components/event-form/event-form';
import { AdminComponent } from './components/admin/admin';
import { DayViewComponent } from './components/day-view/day-view';
import { EventDetailComponent } from './components/event-detail/event-detail';
import { ChoreManagementComponent } from './components/chore-management/chore-management';
import { ChoreListComponent } from './components/chore-list/chore-list';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'day-view/:date', component: DayViewComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'chores', component: ChoreManagementComponent },
  { path: 'chore-list', component: ChoreListComponent },
  { path: '**', redirectTo: '/login' }
];