import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NgSelectModule } from '@ng-select/ng-select';
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
  let mockUserService: DeepMocked<UserService>;
  let mockBoardService: DeepMocked<BoardService>;

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
      isFirstNation: false,
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
      backdropClick: () => new EventEmitter(),
      subscribe: jest.fn(),
    };

    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    mockBoardService = createMock();
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
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        FormsModule,
        MatMenuModule,
        NgSelectModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
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
