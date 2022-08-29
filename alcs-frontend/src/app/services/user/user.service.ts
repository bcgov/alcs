import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService, ICurrentUser } from '../authentication/authentication.service';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';
import { UserDto } from './user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $users = new BehaviorSubject<UserDto[]>([]);
  public $currentUserProfile = new EventEmitter<UserDto>();

  private users: UserDto[] = [];
  private currentUser: ICurrentUser | undefined;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthenticationService,
    private settingsService: SettingsService
  ) {
    this.authService.$currentUser.subscribe((currentUser) => {
      this.currentUser = currentUser;
      if (this.currentUser) {
        this.populateUserProfile(this.currentUser);
      }
    });

    this.$users.subscribe((users) => {
      if (this.currentUser) {
        this.populateUserProfile(this.currentUser);
      }
    });
  }

  private populateUserProfile(currentUser: ICurrentUser) {
    this.$currentUserProfile.emit(this.users.find((u) => u.email === currentUser.email));
  }

  public async fetchUsers() {
    this.users = await firstValueFrom(this.http.get<UserDto[]>(`${this.settingsService.settings.apiUrl}/user`));
    this.$users.next(this.users);
  }

  public async updateUser(user: UserDto) {
    try {
      await firstValueFrom(this.http.patch<UserDto>(`${this.settingsService.settings.apiUrl}/user`, user));
      await this.fetchUsers();
    } catch (e) {
      this.toastService.showErrorToast('Failed to update User');
    }
  }
}
