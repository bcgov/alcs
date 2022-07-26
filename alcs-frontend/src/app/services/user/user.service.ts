import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto } from './user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $users = new BehaviorSubject<UserDto[]>([]);

  private users: UserDto[] = [];

  constructor(private http: HttpClient) {}

  public async fetchUsers() {
    this.users = await firstValueFrom(this.http.get<UserDto[]>(`${environment.apiRoot}/user`));
    this.$users.next(this.users);
  }
}
