import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../authentication/authentication.service';
import { ToastService } from '../toast/toast.service';
import { UserDto } from './user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $users = new BehaviorSubject<UserDto[]>([]);
  public $currentUserProfile = new EventEmitter<UserDto>();

  private users: UserDto[] = [];

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthenticationService
  ) {
    this.$users.subscribe((users) => {
      this.$currentUserProfile.emit(users.find((u) => u.email === this.authService.currentUser.email));
    });
  }

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
