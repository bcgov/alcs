import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { PlanningReviewDto } from '../../../../services/planning-review/planning-review.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto, UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { PlanningReviewDialogComponent } from './planning-review-dialog.component';

describe('PlanningReviewDialogComponent', () => {
  let component: PlanningReviewDialogComponent;
  let fixture: ComponentFixture<PlanningReviewDialogComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockBoardService: jasmine.SpyObj<BoardService>;

  const mockReconDto: PlanningReviewDto = {
    type: 'fake-type',
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

    mockBoardService = jasmine.createSpyObj<BoardService>('BoardService', ['fetchCards']);
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    await TestBed.configureTestingModule({
      declarations: [PlanningReviewDialogComponent],
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
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule, MatMenuModule, SharedModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanningReviewDialogComponent);
    component = fixture.componentInstance;
    component.data = mockReconDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
