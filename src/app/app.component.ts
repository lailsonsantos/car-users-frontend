import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'car-users-frontend';

  constructor(private router: Router) {}

  ngOnInit() {
    this.setupAuthRedirects();
    this.checkInitialAuth();
  }

  private setupAuthRedirects() {
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.handleNavigation(event.urlAfterRedirects);
      });
  }

  private handleNavigation(url: string) {
    const token = localStorage.getItem('token');
    const isSignInRoute = url.includes('/api/signin');
    const isAssetRoute = url.includes('/assets/');

    if (token && isSignInRoute) {
      this.router.navigate(['/api/users']);
    } else if (!token && !isSignInRoute && !isAssetRoute) {
      this.router.navigate(['/api/signin']);
    }
  }

  private checkInitialAuth() {
    const currentPath = window.location.pathname;
    const token = localStorage.getItem('token');
    const isSignInRoute = currentPath.includes('/api/signin');
    const isAssetRoute = currentPath.includes('/assets/');

    if (token && isSignInRoute) {
      this.router.navigate(['/api/users']);
    } else if (!token && !isSignInRoute && !isAssetRoute) {
      this.router.navigate(['/api/signin']);
    }
  }
}