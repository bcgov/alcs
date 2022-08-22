import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
})
export class FavoriteButtonComponent implements OnInit {
  @Input()
  currentUserProfile?: UserDto;
  @Input()
  dmCode: string | undefined;
  @Input()
  isFavorite?: boolean = false;

  constructor(private userService: UserService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.userService.$currentUserProfile.subscribe((user) => {
      this.currentUserProfile = user;

      if (this.dmCode && this.currentUserProfile) {
        this.isFavorite = user.settings.favoriteBoards.includes(this.dmCode);
        console.log(this.dmCode, this.isFavorite);
      }
    });
  }

  private updateFavoriteBoardsList(dmCode: string) {
    if (!this.currentUserProfile) {
      return;
    }

    if (!this.currentUserProfile?.settings?.favoriteBoards) {
      this.currentUserProfile.settings = { favoriteBoards: [] };
    }

    const favoriteBoards = [...this.currentUserProfile.settings.favoriteBoards];
    if (favoriteBoards.includes(dmCode)) {
      const index = favoriteBoards.indexOf(dmCode);
      if (index > -1) {
        favoriteBoards.splice(index, 1);
      }
      this.currentUserProfile.settings.favoriteBoards = favoriteBoards;
      this.isFavorite = false;
    } else {
      this.currentUserProfile.settings.favoriteBoards.push(dmCode);
      this.isFavorite = true;
    }
  }

  async onFavoriteClicked(event: any) {
    event.stopPropagation();

    if (!this.currentUserProfile || !this.dmCode) {
      return;
    }

    this.updateFavoriteBoardsList(this.dmCode);

    try {
      await this.userService.updateUser(this.currentUserProfile);
    } catch {
      this.toastService.showErrorToast('Failed to set favorites');
    }
  }
}
