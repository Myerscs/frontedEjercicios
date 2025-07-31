import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SplashPage implements OnInit, OnDestroy {
  showAnimations = false;
  isExiting = false;
  private autoNavigateTimer?: ReturnType<typeof setTimeout>;


  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is already authenticated
    this.checkAuthenticationStatus();
    
    // Start animations after a short delay
    setTimeout(() => {
      this.showAnimations = true;
    }, 300);

    // Auto-navigate after 4 seconds if user doesn't interact
    this.autoNavigateTimer = setTimeout(() => {
      this.navigateToLogin();
    }, 4000);
  }

  ngOnDestroy() {
    if (this.autoNavigateTimer) {
      clearTimeout(this.autoNavigateTimer);
    }
  }

  private checkAuthenticationStatus() {
    // If user is already authenticated, go directly to dashboard
    if (this.authService.isAuthenticated()) {
      setTimeout(() => {
        this.navigateToTabs();
      }, 2000); // Give time to see the splash
    }
  }

  navigateToLogin() {
    // Clear auto-navigate timer
    if (this.autoNavigateTimer) {
      clearTimeout(this.autoNavigateTimer);
    }

    // Start exit animation
    this.isExiting = true;
    
    // Navigate after animation completes
    setTimeout(() => {
      this.router.navigate(['/login'], { 
        replaceUrl: true,
        state: { fromSplash: true } 
      });
    }, 500);
  }

  private navigateToTabs() {
    this.isExiting = true;
    
    setTimeout(() => {
      this.router.navigate(['/tabs'], { 
        replaceUrl: true 
      });
    }, 500);
  }

  // Method to handle manual tap/click
  onScreenTap() {
    this.navigateToLogin();
  }
}