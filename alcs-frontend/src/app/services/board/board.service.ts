import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto } from '../application/application.dto';
import { UserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { BoardDto, CardsDto, MinimalBoardDto } from './board.dto';

export interface BoardWithFavourite extends MinimalBoardDto {
  isFavourite: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private boards?: MinimalBoardDto[];
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
        this.boards = await firstValueFrom(this.http.get<MinimalBoardDto[]>(`${environment.apiUrl}/board`));
      }
      const mappedBoards = this.boards.map((board) => ({
        ...board,
        isFavourite: this.userProfile!.settings?.favoriteBoards?.includes(board.code) ?? false,
      }));
      this.boardsEmitter.next(mappedBoards);
    }
    return;
  }

  fetchBoardDetail(boardCode: string) {
    return firstValueFrom(this.http.get<BoardDto>(`${environment.apiUrl}/board/${boardCode}`));
  }

  fetchBoardWithCards(boardCode: string) {
    return firstValueFrom(this.http.get<CardsDto>(`${environment.apiUrl}/board/${boardCode}/cards`));
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
