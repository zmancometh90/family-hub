import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { EventService } from '../../services/event.service';
import { UserDTO, UserRequest, UserRole, AdminPasswordChangeRequest } from '../../models/user.model';
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

  // Password change functionality
  passwordChangeData = {
    selectedUserId: '',
    adminPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Password visibility toggles
  showAdminPassword = false;
  showUserNewPassword = false;
  showConfirmUserPassword = false;
  
  // Password change specific messages and loading state
  passwordSuccessMessage = '';
  passwordErrorMessage = '';
  isChangingPassword = false;

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
    this.clearPasswordMessages();
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

  // Password change functionality
  showAdminPasswordTemporarily(): void {
    this.showAdminPassword = true;
  }

  hideAdminPassword(): void {
    this.showAdminPassword = false;
  }

  showUserNewPasswordTemporarily(): void {
    this.showUserNewPassword = true;
  }

  hideUserNewPassword(): void {
    this.showUserNewPassword = false;
  }

  showConfirmUserPasswordTemporarily(): void {
    this.showConfirmUserPassword = true;
  }

  hideConfirmUserPassword(): void {
    this.showConfirmUserPassword = false;
  }

  clearPasswordMessages(): void {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
  }

  resetPasswordForm(): void {
    this.passwordChangeData = {
      selectedUserId: '',
      adminPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showAdminPassword = false;
    this.showUserNewPassword = false;
    this.showConfirmUserPassword = false;
    this.clearPasswordMessages();
  }

  changeUserPassword(): void {
    this.clearPasswordMessages();

    // Validation
    if (!this.passwordChangeData.selectedUserId) {
      this.passwordErrorMessage = 'Please select a user';
      return;
    }

    if (!this.passwordChangeData.adminPassword) {
      this.passwordErrorMessage = 'Please enter your admin password for verification';
      return;
    }

    if (!this.passwordChangeData.newPassword) {
      this.passwordErrorMessage = 'Please enter a new password';
      return;
    }

    if (this.passwordChangeData.newPassword.length < 6) {
      this.passwordErrorMessage = 'New password must be at least 6 characters long';
      return;
    }

    if (this.passwordChangeData.newPassword !== this.passwordChangeData.confirmPassword) {
      this.passwordErrorMessage = 'New password and confirmation do not match';
      return;
    }

    const selectedUser = this.users.find(u => u.id === this.passwordChangeData.selectedUserId);
    if (!selectedUser) {
      this.passwordErrorMessage = 'Selected user not found';
      return;
    }

    this.isChangingPassword = true;

    const request: AdminPasswordChangeRequest = {
      adminPassword: this.passwordChangeData.adminPassword,
      targetUserId: this.passwordChangeData.selectedUserId,
      newPassword: this.passwordChangeData.newPassword
    };

    this.userService.adminChangePassword(request).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccessMessage = `Password changed successfully for user "${selectedUser.name}"`;
        
        // Clear the form after successful change
        this.resetPasswordForm();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.passwordSuccessMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isChangingPassword = false;
        console.error('Admin password change error:', error);
        
        if (error.status === 401) {
          this.passwordErrorMessage = 'Admin password is incorrect';
        } else if (error.status === 403) {
          this.passwordErrorMessage = 'You do not have permission to change passwords';
        } else if (error.status === 400) {
          this.passwordErrorMessage = error.error?.message || 'Invalid password change request';
        } else if (error.status === 404) {
          this.passwordErrorMessage = 'Selected user not found';
        } else if (error.status === 0) {
          this.passwordErrorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.passwordErrorMessage = `Password change failed: ${error.error?.message || 'Unknown error'}`;
        }
      }
    });
  }
}