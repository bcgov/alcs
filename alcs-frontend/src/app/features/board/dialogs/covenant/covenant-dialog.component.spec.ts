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
import { CovenantDto } from '../../../../services/covenant/covenant.dto';
import { CovenantService } from '../../../../services/covenant/covenant.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CovenantDialogComponent } from './covenant-dialog.component';

describe('CovenantDialogComponent', () => {
  let component: CovenantDialogComponent;
  let fixture: ComponentFixture<CovenantDialogComponent>;
  let mockUserService: DeepMocked<UserService>;
  let mockBoardService: DeepMocked<BoardService>;
  let authenticationService: DeepMocked<AuthenticationService>;

  const mockCovenantDto: CovenantDto = {
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
    },
    fileNumber: 'file-number',
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
      subscribe: jest.fn(),
      backdropClick: () => new EventEmitter(),
    };
    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    mockBoardService = createMock();
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    authenticationService = createMock();
    authenticationService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [CovenantDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockCovenantDto,
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
          provide: CovenantService,
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

    fixture = TestBed.createComponent(CovenantDialogComponent);
    component = fixture.componentInstance;
    component.data = mockCovenantDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
