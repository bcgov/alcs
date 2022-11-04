import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { CovenantDto } from '../../../../services/covenant/covenant.dto';
import { CovenantService } from '../../../../services/covenant/covenant.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { CovenantDialogComponent } from './covenant-dialog.component';

describe('ReconsiderationDialogComponent', () => {
  let component: CovenantDialogComponent;
  let fixture: ComponentFixture<CovenantDialogComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockBoardService: jasmine.SpyObj<BoardService>;

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
      board: {
        code: 'FAKE_BOARD',
      },
    } as CardDto,
  };

  beforeEach(async () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed', 'backdropClick', 'subscribe']);
    mockDialogRef.backdropClick = () => new EventEmitter();

    mockUserService = jasmine.createSpyObj<UserService>('UserService', ['fetchAssignableUsers']);
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    mockBoardService = jasmine.createSpyObj<BoardService>('BoardService', ['fetchCards', 'changeBoard']);
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

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
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
      imports: [MatDialogModule, MatSnackBarModule, FormsModule, MatMenuModule, RouterTestingModule, SharedModule],
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
