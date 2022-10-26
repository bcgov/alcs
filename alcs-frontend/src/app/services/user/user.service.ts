import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService, ICurrentUser } from '../authentication/authentication.service';
import { ToastService } from '../toast/toast.service';
import { UpdateUserDto, UserDto } from './user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $users = new BehaviorSubject<UserDto[]>([]);
  public $currentUserProfile = new BehaviorSubject<UserDto | undefined>(undefined);

  private users: UserDto[] = [];

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthenticationService
  ) {
    this.authService.$currentUser.pipe(combineLatestWith(this.$users)).subscribe(([currentUser, users]) => {
      if (currentUser && users.length > 0) {
        this.populateUserProfile(currentUser);
      }
    });
  }

  private populateUserProfile(currentUser: ICurrentUser) {
    const currentUserDto = this.users.find((u) => u.email === currentUser.email);
    if (currentUserDto) {
      this.$currentUserProfile.next(currentUserDto);
    } else {
      console.error('Failed to find current user in users');
    }
  }

  public async fetchUsers() {
    this.users = await firstValueFrom(this.http.get<UserDto[]>(`${environment.apiUrl}/user`));
    this.$users.next(this.users);
  }

  public async updateUser(uuid: string, user: UpdateUserDto) {
    try {
      await firstValueFrom(this.http.patch<UserDto>(`${environment.apiUrl}/user`, user));
      await this.fetchUsers();
    } catch (e) {
      this.toastService.showErrorToast('Failed to update User');
    }
  }
}
