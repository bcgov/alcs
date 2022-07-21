import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const JWT_TOKEN_KEY = 'jwt_token';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnInit {
  private token: string | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  async setToken(token: string) {
    const valid = await this.isTokenValid(token);
    if (valid) {
      this.token = token;
      localStorage.setItem('jwt_token', token);
    }
  }

  getToken() {
    return this.token;
  }

  async loadTokenFromStorage() {
    const existingToken = localStorage.getItem(JWT_TOKEN_KEY);
    if (existingToken) {
      await this.setToken(existingToken);
      return true;
    }
    return false;
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
}
