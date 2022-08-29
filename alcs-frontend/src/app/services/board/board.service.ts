import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto } from '../application/application.dto';
import { UserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { BoardDto } from './board.dto';

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
    this.userService.$currentUserProfile.subscribe((user) => {
      this.userProfile = user;
      this.publishBoards();
    });
  }

  private async publishBoards() {
    if (this.userProfile !== undefined) {
      if (!this.boards) {
        this.boards = await firstValueFrom(this.http.get<BoardDto[]>(`${environment.apiRoot}/board`));
      }
      const mappedBoards = this.boards.map((board) => ({
        ...board,
        isFavourite: this.userProfile!.settings?.favoriteBoards?.includes(board.code) ?? false,
      }));
      this.boardsEmitter.next(mappedBoards);
    }
    return;
  }

  fetchApplications(boardCode: string) {
    return firstValueFrom(this.http.get<ApplicationDto[]>(`${environment.apiRoot}/board/${boardCode}`));
  }

  changeBoard(fileNumber: string, boardCode: string) {
    return firstValueFrom(
      this.http.post<ApplicationDto>(`${environment.apiRoot}/board/change`, {
        fileNumber,
        boardCode,
      })
    );
  }
}
