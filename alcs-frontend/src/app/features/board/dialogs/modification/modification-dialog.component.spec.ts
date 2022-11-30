import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationModificationDto } from '../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';

import { ModificationDialogComponent } from './modification-dialog.component';

describe('ModificationDialogComponent', () => {
  let component: ModificationDialogComponent;
  let fixture: ComponentFixture<ModificationDialogComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockBoardService: jasmine.SpyObj<BoardService>;

  const mockModificationDto: ApplicationModificationDto = {
    uuid: '',
    modifiesDecisions: [],
    reviewOutcome: { label: 'mock', code: 'MOCK', description: 'mock' },
    isTimeExtension: true,
    reviewDate: 111111,
    submittedDate: 111111,
    application: {
      statusCode: '',
      fileNumber: '',
      type: {} as ApplicationTypeDto,
      applicant: '',
      region: {
        code: 'FAKE_REGION',
      } as ApplicationRegionDto,
      localGovernment: {} as ApplicationLocalGovernmentDto,
      decisionMeetings: [],
    },
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

    mockBoardService = jasmine.createSpyObj<BoardService>('BoardService', ['fetchCards']);
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    await TestBed.configureTestingModule({
      declarations: [ModificationDialogComponent],
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
          provide: ApplicationModificationService,
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

    fixture = TestBed.createComponent(ModificationDialogComponent);
    component = fixture.componentInstance;
    component.data = mockModificationDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
