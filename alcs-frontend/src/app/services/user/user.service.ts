import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../authentication/authentication.service';
import { ToastService } from '../toast/toast.service';
import { AssigneeDto, UpdateUserDto, UserDto } from './user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);
  private assignableUsers: AssigneeDto[] = [];

  public $userProfile = new BehaviorSubject<UserDto | undefined>(undefined);
  private userProfile: UserDto | undefined;

  private baseUrl = `${environment.authUrl}/user`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthenticationService
  ) {
    this.authService.$currentUser.subscribe((userToken) => {
      if (userToken && !this.userProfile) {
        this.populateUserProfile();
      }
    });
  }

  private async populateUserProfile() {
    this.userProfile = await firstValueFrom(this.http.get<UserDto>(`${this.baseUrl}/profile`));
    this.$userProfile.next(this.userProfile);
  }

  public async fetchAssignableUsers() {
    this.clearAssignableUsers();
    this.assignableUsers = await firstValueFrom(this.http.get<AssigneeDto[]>(`${this.baseUrl}/assignable`));
    this.$assignableUsers.next(this.assignableUsers);
  }

  public async updateUserProfile(uuid: string, updateDto: UpdateUserDto) {
    try {
      await firstValueFrom(this.http.patch<UserDto>(`${environment.authUrl}/user/${uuid}`, updateDto));
      await this.populateUserProfile();
    } catch (e) {
      this.toastService.showErrorToast('Failed to update User');
    }
  }

  clearAssignableUsers() {
    this.$assignableUsers.next([]);
  }
}
