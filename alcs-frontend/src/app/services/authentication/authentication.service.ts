import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const JWT_TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnInit {
  private token: string | undefined;
  private refreshToken: string | undefined;
  private expires: number | undefined;
  isInitialized = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTokenFromStorage();
  }

  async setTokens(token: string, refreshToken: string) {
    const valid = await this.isTokenValid(token);
    if (valid) {
      this.token = token;
      this.refreshToken = refreshToken;
      localStorage.setItem(JWT_TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      const decodedToken = jwtDecode<JwtPayload>(token);

      //Convert to MS for JS consistency
      this.expires = decodedToken.exp! * 1000;
    }
    return valid;
  }

  clearTokens() {
    this.token = undefined;
    this.refreshToken = undefined;
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async getToken() {
    if (this.token && this.refreshToken && this.expires && this.expires < Date.now()) {
      //Clear token to prevent infinite loop from interceptor
      this.token = undefined;

      const newTokens = await this.getNewTokens(this.refreshToken);
      await this.setTokens(newTokens.token, newTokens.refresh_token);
    }
    return this.token;
  }

  async loadTokenFromStorage() {
    const existingToken = localStorage.getItem(JWT_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const res = this.setTokens(existingToken || '', refreshToken || '');
    this.isInitialized = true;
    return res;
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
        this.http.get(`${environment.apiRoot}/admin`, {
          responseType: 'text',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      return true;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        //Take user to login
        //TODO: Can we use something other than e.error?
        window.location.href = e.error;
      }
      throw e;
    }
  }

  private async getNewTokens(refreshToken: string) {
    const res = await firstValueFrom(
      this.http.get<{
        refresh_token: string;
        token: string;
      }>(`${environment.apiRoot}/authorize/refresh?r=${refreshToken}`)
    );
    return res;
  }

  private async getLogoutUrl() {
    return firstValueFrom(this.http.get<{ url: string }>(`${environment.apiRoot}/logout`));
  }
}
