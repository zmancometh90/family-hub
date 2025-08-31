import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { EventService } from '../../services/event.service';
import { UserDTO, UserRequest, UserRole } from '../../models/user.model';
import { EventDTO } from '../../models/event.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  currentUser: UserDTO | null = null;
  users: UserDTO[] = [];
  events: EventDTO[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // User creation form
  showCreateUserForm = false;
  newUserRequest: UserRequest = {
    username: '',
    password: '',
    name: '',
    role: UserRole.BASIC_USER
  };

  // Statistics
  stats = {
    totalUsers: 0,
    totalEvents: 0,
    adminUsers: 0,
    activeEvents: 0
  };

  activeTab = 'overview';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadUsers();
    this.loadEvents();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.updateStats();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Error loading users';
      }
    });
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.errorMessage = 'Error loading events';
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.totalEvents = this.events.length;
    this.stats.adminUsers = this.users.filter(u => u.role === UserRole.ADMIN).length;
    this.stats.activeEvents = this.events.filter(e => 
      e.status === 'PLANNED' || e.status === 'CONFIRMED'
    ).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  toggleCreateUserForm(): void {
    this.showCreateUserForm = !this.showCreateUserForm;
    if (this.showCreateUserForm) {
      this.resetNewUserForm();
    }
  }

  resetNewUserForm(): void {
    this.newUserRequest = {
      username: '',
      password: '',
      name: '',
      role: UserRole.BASIC_USER
    };
    this.clearMessages();
  }

  createUser(): void {
    if (!this.validateUserForm()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.userService.createUser(this.newUserRequest).subscribe({
      next: (user) => {
        this.successMessage = `User "${user.name}" created successfully`;
        this.loadUsers();
        this.showCreateUserForm = false;
        this.resetNewUserForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.errorMessage = 'Error creating user. Username may already exist.';
        this.isLoading = false;
      }
    });
  }

  validateUserForm(): boolean {
    if (!this.newUserRequest.username.trim()) {
      this.errorMessage = 'Username is required';
      return false;
    }
    if (!this.newUserRequest.password.trim()) {
      this.errorMessage = 'Password is required';
      return false;
    }
    if (!this.newUserRequest.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    if (this.newUserRequest.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }
    return true;
  }

  toggleUserStatus(user: UserDTO): void {
    if (!user.id) return;

    const updatedUser = { ...user, active: !user.active };
    this.userService.updateUser(user.id, updatedUser).subscribe({
      next: (updated) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updated;
        }
        this.successMessage = `User status updated successfully`;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = 'Error updating user status';
      }
    });
  }

  deleteUser(user: UserDTO): void {
    if (!user.id) return;
    
    if (user.id === this.currentUser?.id) {
      this.errorMessage = 'You cannot delete your own account';
      return;
    }

    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.clearMessages();
      
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.updateStats();
          this.successMessage = `User "${user.name}" deleted successfully`;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'Error deleting user';
          this.isLoading = false;
        }
      });
    }
  }

  deleteEvent(event: EventDTO): void {
    if (!event.id) return;

    if (confirm(`Are you sure you want to delete event "${event.title}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.clearMessages();
      
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== event.id);
          this.updateStats();
          this.successMessage = `Event "${event.title}" deleted successfully`;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.errorMessage = 'Error deleting event';
          this.isLoading = false;
        }
      });
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatEventType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getUserRoles(): UserRole[] {
    return Object.values(UserRole);
  }
}