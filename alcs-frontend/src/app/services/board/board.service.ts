import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto } from '../application/application.dto';
import { UserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { BoardDto, CardsDto } from './board.dto';

export interface BoardWithFavourite extends BoardDto {
  isFavourite: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private boards?: BoardDto[];
  private userProfile?: UserDto;
  private boardsEmitter = new BehaviorSubject<BoardWithFavourite[]>([]);
  $boards = this.boardsEmitter.asObservable();

  constructor(private http: HttpClient, private userService: UserService) {
    this.userService.$userProfile.subscribe((user) => {
      this.userProfile = user;
      this.publishBoards();
    });
  }

  async reloadBoards() {
    this.boardsEmitter.next([]);
    await this.publishBoards(true);
  }

  private async publishBoards(reload = false) {
    if (this.userProfile !== undefined) {
      if (!this.boards || reload) {
        this.boards = await firstValueFrom(this.http.get<BoardDto[]>(`${environment.apiUrl}/board`));
      }
      const mappedBoards = this.boards.map((board) => ({
        ...board,
        isFavourite: this.userProfile!.settings?.favoriteBoards?.includes(board.code) ?? false,
      }));
      this.boardsEmitter.next(mappedBoards);
    }
    return;
  }

  fetchCards(boardCode: string) {
    return firstValueFrom(this.http.get<CardsDto>(`${environment.apiUrl}/board/${boardCode}`));
  }

  changeBoard(cardUuid: string, boardCode: string) {
    return firstValueFrom(
      this.http.post<ApplicationDto>(`${environment.apiUrl}/board/change`, {
        cardUuid,
        boardCode,
      })
    );
  }
}
