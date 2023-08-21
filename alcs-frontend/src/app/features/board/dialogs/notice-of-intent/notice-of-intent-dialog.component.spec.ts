import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { NoticeOfIntentDto, NoticeOfIntentTypeDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SYSTEM_SOURCE_TYPES } from '../../../../shared/dto/system-source.types.dto';
import { NoticeOfIntentDialogComponent } from './notice-of-intent-dialog.component';

describe('NoticeOfIntentDialogComponent', () => {
  let component: NoticeOfIntentDialogComponent;
  let fixture: ComponentFixture<NoticeOfIntentDialogComponent>;
  let mockUserService: DeepMocked<UserService>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;
  let authenticationService: DeepMocked<AuthenticationService>;

  const mockDto: NoticeOfIntentDto = {
    applicant: 'fake-type',
    region: {
      code: 'region-code',
      label: 'region',
      description: 'WHY',
    },
    localGovernment: {
      name: 'local-gov',
      uuid: 'uuid',
      preferredRegionCode: 'CODE',
      isFirstNation: false,
    },
    fileNumber: 'file-number',
    card: {
      status: {
        code: 'FAKE_STATUS',
      },
      boardCode: 'FAKE_BOARD',
    } as CardDto,
    activeDays: 0,
    paused: false,
    pausedDays: 0,
    uuid: '',
    retroactive: null,
    subtype: [],
    type: {} as NoticeOfIntentTypeDto,
    source: SYSTEM_SOURCE_TYPES.ALCS,
  };

  beforeEach(async () => {
    const mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
      subscribe: jest.fn(),
      backdropClick: () => new EventEmitter(),
    };
    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    mockBoardService = createMock();
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    authenticationService = createMock();
    authenticationService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    mockNOIService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NoticeOfIntentDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDto,
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
          provide: NoticeOfIntentService,
          useValue: {},
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNOIService,
        },
        {
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
      imports: [MatDialogModule, MatSnackBarModule, FormsModule, MatMenuModule, RouterTestingModule, NgSelectModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentDialogComponent);
    component = fixture.componentInstance;
    component.data = mockDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
