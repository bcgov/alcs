import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private token: string | undefined;

  constructor(private http: HttpClient) {}

  async setToken(token: string) {
    const valid = await this.isTokenValid(token);
    if (valid) {
      this.token = token;
    }
  }

  getToken() {
    return this.token;
  }

  async isTokenValid(token: string) {
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
        return false;
      }
      throw e;
    }
  }
}
