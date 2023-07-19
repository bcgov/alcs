import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

const refreshTokenTime = 4 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private interval: number | undefined;

  constructor(private authenticationService: AuthenticationService) {}

  init() {
    this.authenticationService.$currentTokenUser.subscribe((user) => {
      if (user) {
        if (this.interval) {
          clearInterval(this.interval);
        }
        this.interval = window.setInterval(() => {
          this.authenticationService.refreshTokens();
        }, refreshTokenTime);
      }
    });
  }
}
