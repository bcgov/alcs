import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../services/application/application-code.dto';
import { BoardService } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { NotificationDto } from '../../../../services/notification/notification.dto';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { NotificationDialogComponent } from './notification-dialog.component';

describe('NotificationDialogComponent', () => {
  let component: NotificationDialogComponent;
  let fixture: ComponentFixture<NotificationDialogComponent>;
  let mockBoardService: DeepMocked<BoardService>;

  const mockAssignee: AssigneeDto = {
    uuid: '11111-11111-11111',
    name: 'Dart',
    initials: 'DP',
    clientRoles: [],
    email: 'email',
    mentionLabel: 'mention-label',
    prettyName: 'pretty-name',
  };

  const mockApplicationRegion: ApplicationRegionDto = {
    label: 'test_st',
    code: 'STATUS',
    description: 'this is a test status',
  };

  const mockApplicationType: ApplicationTypeDto = {
    label: 'test_ty',
    code: 'TYPE',
    description: 'this is a test type',
    shortLabel: 'short_label',
    textColor: '#000',
    backgroundColor: '#fff',
  };

  const mockApplication: NotificationDto = {
    uuid: '',
    type: mockApplicationType,
    region: mockApplicationRegion,
    fileNumber: '1111',
    applicant: 'I am an applicant',
    localGovernment: {
      uuid: 'fake',
      name: 'Local Government',
      preferredRegionCode: 'FAKE_CODE',
      isFirstNation: false,
    },
    summary: 'MOCK SUMMARY',
    dateSubmittedToAlc: Date.now(),
    card: {
      boardCode: 'a',
      assignee: mockAssignee,
      highPriority: false,
      status: {
        code: 'card-status',
      },
    } as CardDto,
  };

  beforeEach(async () => {
    const mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
      backdropClick: () => new EventEmitter(),
      subscribe: jest.fn(),
    };

    mockBoardService = createMock();
    mockBoardService.$boards = new EventEmitter();
    mockBoardService.fetchBoardDetail.mockResolvedValue({
      allowedCardTypes: [],
      code: '',
      createCardTypes: [],
      showOnSchedule: false,
      statuses: [],
      title: '',
    });

    await TestBed.configureTestingModule({
      declarations: [NotificationDialogComponent],
      imports: [HttpClientTestingModule, SharedModule, BrowserAnimationsModule, RouterTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationDialogComponent);
    component = fixture.componentInstance;
    component.data = mockApplication;
    component.boardStatuses = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
