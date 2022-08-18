import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { UserDto } from './user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $users = new BehaviorSubject<UserDto[]>([]);

  private users: UserDto[] = [];

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public async fetchUsers() {
    this.users = await firstValueFrom(this.http.get<UserDto[]>(`${environment.apiRoot}/user`));
    this.$users.next(this.users);
  }

  public async updateUser(user: UserDto) {
    try {
      await firstValueFrom(this.http.patch<UserDto>(`${environment.apiRoot}/user`, user));
      await this.fetchUsers();
    } catch (e) {
      this.toastService.showErrorToast('Failed to update User');
    }
  }
}
