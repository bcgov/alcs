import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto } from './authentication.dto';

const JWT_TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface ICurrentUser {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private token: string | undefined;
  private refreshToken: string | undefined;
  private expires: number | undefined;
  private refreshExpires: number | undefined;

  isInitialized = false;
  $currentTokenUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);
  $currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);
  currentUser: ICurrentUser | undefined;

  constructor(private http: HttpClient, private router: Router) {}

  async setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem(JWT_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    const decodedToken = jwtDecode<JwtPayload>(token);
    const decodedRefreshToken = jwtDecode<JwtPayload>(refreshToken);

    //Convert to MS for JS consistency
    this.refreshExpires = decodedRefreshToken.exp! * 1000;
    this.expires = decodedToken.exp! * 1000;
    this.currentUser = decodedToken as ICurrentUser;
    this.$currentTokenUser.next(this.currentUser);
    this.loadUser();
  }

  clearTokens() {
    this.token = undefined;
    this.refreshToken = undefined;
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async getLoginUrl() {
    return firstValueFrom(this.http.get<{ loginUrl: string }>(`${environment.authUrl}/authorize/login`));
  }

  async getToken(redirect = true) {
    if (!this.isInitialized) {
      this.isInitialized = true;
      await this.loadTokenFromStorage(redirect);
    }

    if (this.token && this.refreshToken && this.expires && this.expires < Date.now()) {
      //Clear token to prevent infinite loop from interceptor
      this.token = undefined;
      await this.refreshTokens(redirect);
    }
    return this.token;
  }

  async refreshTokens(redirect = true) {
    if (this.refreshToken) {
      if (this.refreshExpires && this.refreshExpires < Date.now()) {
        if (redirect) {
          await this.router.navigateByUrl('/login');
        }
        return;
      }

      const newTokens = await this.getNewTokens(this.refreshToken);
      await this.setTokens(newTokens.token, newTokens.refresh_token);
    }
  }

  private async loadTokenFromStorage(redirect = true) {
    const existingToken = localStorage.getItem(JWT_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (existingToken && refreshToken) {
      const valid = await this.isTokenValid(existingToken);
      if (valid) {
        await this.setTokens(existingToken, refreshToken);
        //Refresh Tokens Immediately to reset the refresh tokens validity to 5 minutes
        await this.refreshTokens(redirect);
      }
    }
  }

  async logout() {
    const logoutUrl = await this.getLogoutUrl();
    if (logoutUrl) {
      this.clearTokens();
      window.location.href = logoutUrl.url;
    }
  }

  private async isTokenValid(token: string) {
    try {
      await firstValueFrom(
        this.http.get(`${environment.authUrl}/token`, {
          responseType: 'text',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      return true;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        return false;
      }
      throw e;
    }
  }

  private async getNewTokens(refreshToken: string) {
    const res = await firstValueFrom(
      this.http.get<{
        refresh_token: string;
        token: string;
      }>(`${environment.authUrl}/authorize/refresh?r=${refreshToken}`)
    );
    return res;
  }

  private async getLogoutUrl() {
    return firstValueFrom(this.http.get<{ url: string }>(`${environment.authUrl}/logout/portal`));
  }

  private async loadUser() {
    const user = await firstValueFrom(this.http.get<UserDto>(`${environment.authUrl}/user/profile`));
    this.$currentProfile.next(user);
  }
}
