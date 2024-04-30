import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(private router: Router) {}

  init() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        (window as any).snowplow('trackPageView');
      }
    });
  }
}
