import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  currentUser: UserDTO | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToGroceryList(): void {
    this.router.navigate(['/grocery-list']);
  }

  navigateToChoreList(): void {
    this.router.navigate(['/chore-list']);
  }

  navigateToAdmin(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  navigateToChores(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/chores']);
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  openUserSettings(): void {
    this.showUserMenu = false;
    this.router.navigate(['/settings']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu');
    if (!userMenu && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }

  // Avatar functionality
  getUserInitial(): string {
    if (!this.currentUser) return 'U';
    return this.currentUser.name.charAt(0).toUpperCase();
  }

  getUserAvatar(): string {
    return this.currentUser?.avatar || this.getUserInitial();
  }
}