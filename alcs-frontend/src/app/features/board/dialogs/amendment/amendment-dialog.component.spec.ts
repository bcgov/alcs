import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { ApplicationAmendmentDto } from '../../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../../../services/application/application-amendment/application-amendment.service';
import {
  ApplicationRegionDto,
  ApplicationTypeDto,
  CardStatusDto,
} from '../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../services/application/application-local-government/application-local-government.dto';
import {
  ApplicationReconsiderationDto,
  ReconsiderationTypeDto,
} from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { BoardDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';

import { AmendmentDialogComponent } from './amendment-dialog.component';

describe('AmendmentDialogComponent', () => {
  let component: AmendmentDialogComponent;
  let fixture: ComponentFixture<AmendmentDialogComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockBoardService: jasmine.SpyObj<BoardService>;

  const mockAmendmentDto: ApplicationAmendmentDto = {
    uuid: '',
    isReviewApproved: false,
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

    mockUserService = jasmine.createSpyObj<UserService>('UserService', ['fetchUsers']);
    mockUserService.$users = new BehaviorSubject<UserDto[]>([]);

    mockBoardService = jasmine.createSpyObj<BoardService>('BoardService', ['fetchCards']);
    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    await TestBed.configureTestingModule({
      declarations: [AmendmentDialogComponent],
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
          provide: ApplicationAmendmentService,
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

    fixture = TestBed.createComponent(AmendmentDialogComponent);
    component = fixture.componentInstance;
    component.data = mockAmendmentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
