import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto } from '../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../services/application/application-local-government/application-local-government.dto';
import { AuthenticationService, ICurrentUser } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { NoticeOfIntentModificationDto } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { NoiModificationDialogComponent } from './noi-modification-dialog.component';

describe('NoiModificationDialogComponent', () => {
  let component: NoiModificationDialogComponent;
  let fixture: ComponentFixture<NoiModificationDialogComponent>;
  let mockUserService: DeepMocked<UserService>;
  let mockBoardService: DeepMocked<BoardService>;
  let authenticationService: DeepMocked<AuthenticationService>;

  const mockModificationDto: NoticeOfIntentModificationDto = {
    uuid: '',
    modifiesDecisions: [],
    reviewOutcome: { label: 'mock', code: 'MOCK', description: 'mock' },
    reviewDate: 111111,
    submittedDate: 111111,
    noticeOfIntent: {
      statusCode: '',
      fileNumber: '',
      applicant: '',
      region: {
        code: 'FAKE_REGION',
      } as ApplicationRegionDto,
      localGovernment: {} as ApplicationLocalGovernmentDto,
      retroactive: false,
    },
    outcomeNotificationDate: null,
    card: {
      status: {
        code: 'FAKE_STATUS',
      },
      boardCode: 'FAKE_BOARD',
    } as CardDto,
  };

  beforeEach(async () => {
    const mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
      backdropClick: () => new EventEmitter(),
      subscribe: jest.fn(),
    };

    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    mockBoardService = createMock();
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    authenticationService = createMock();
    authenticationService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [NoiModificationDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            statusDetails: {
              code: 'fake',
            },
          },
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
          provide: NoticeOfIntentModificationService,
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
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
      imports: [MatDialogModule, MatSnackBarModule, FormsModule, MatMenuModule, RouterTestingModule, NgSelectModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoiModificationDialogComponent);
    component = fixture.componentInstance;
    component.data = mockModificationDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
