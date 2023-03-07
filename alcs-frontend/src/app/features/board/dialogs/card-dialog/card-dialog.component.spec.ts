import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../../../services/authentication/authentication.service';
import { BoardService } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';

import { CardDialogComponent } from './card-dialog.component';

describe('CardDialogComponent', () => {
  let component: CardDialogComponent;
  let fixture: ComponentFixture<CardDialogComponent>;

  let mockUserService: DeepMocked<UserService>;
  let authenticationService: DeepMocked<AuthenticationService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    const mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
      subscribe: jest.fn(),
      backdropClick: () => new EventEmitter(),
    };

    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    authenticationService = createMock();
    authenticationService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    mockBoardService = createMock();
    mockBoardService.$boards = new EventEmitter();

    await TestBed.configureTestingModule({
      declarations: [CardDialogComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CardService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
      imports: [MatDialogModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
