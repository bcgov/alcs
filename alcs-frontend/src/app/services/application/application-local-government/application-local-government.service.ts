import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApplicationLocalGovernmentDto } from './application-local-government.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationLocalGovernmentService {
  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.apiUrl}/application-local-government`;

  async list() {
    return firstValueFrom(this.http.get<ApplicationLocalGovernmentDto[]>(`${this.baseUrl}`));
  }
}
