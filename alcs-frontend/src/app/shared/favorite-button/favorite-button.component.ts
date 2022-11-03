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
  @Input() currentUserProfile?: UserDto;
  @Input() boardCode?: string;
  @Input() isFavorite?: boolean = false;
  @Input() disableTooltip?: boolean = false;

  constructor(private userService: UserService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.userService.$userProfile.subscribe((user) => {
      this.currentUserProfile = user;

      if (user && this.boardCode && this.currentUserProfile) {
        this.isFavorite = user.settings?.favoriteBoards?.includes(this.boardCode);
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

    const favoriteBoards = [...this.currentUserProfile.settings?.favoriteBoards];
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

    if (!this.currentUserProfile || !this.boardCode) {
      console.warn('Failed to favourite board, missing either user profile or board code');
      this.toastService.showErrorToast('Failed to set favourites');
      return;
    }

    this.updateFavoriteBoardsList(this.boardCode);

    try {
      await this.userService.updateUserProfile(this.currentUserProfile.uuid, {
        settings: this.currentUserProfile.settings,
      });
    } catch {
      this.toastService.showErrorToast('Failed to set favourites');
    }
  }
}
