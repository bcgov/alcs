import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../services/application/application-code.dto';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { BoardService } from '../../../../services/board/board.service';
import { CardDto } from '../../../../services/card/card.dto';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationDialogComponent } from './application-dialog.component';

describe('ApplicationDialogComponent', () => {
  let component: ApplicationDialogComponent;
  let fixture: ComponentFixture<ApplicationDialogComponent>;
  let mockBoardService: DeepMocked<BoardService>;

  const mockAssignee: AssigneeDto = {
    uuid: '11111-11111-11111',
    name: 'Dart',
    initials: 'DP',
    clientRoles: [],
    email: 'email',
    mentionLabel: 'mention-label',
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

  const mockApplication: ApplicationDto = {
    type: mockApplicationType,
    region: mockApplicationRegion,
    fileNumber: '1111',
    applicant: 'I am an applicant',
    localGovernment: {
      uuid: 'fake',
      name: 'Local Government',
      preferredRegionCode: 'FAKE_CODE',
    },
    summary: 'MOCK SUMMARY',
    activeDays: 10,
    pausedDays: 5,
    paused: true,
    decisionMeetings: [],
    dateSubmittedToAlc: Date.now(),
    card: {
      assignee: mockAssignee,
      highPriority: false,
      board: {
        code: 'board-code',
      },
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

    await TestBed.configureTestingModule({
      declarations: [ApplicationDialogComponent],
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

    fixture = TestBed.createComponent(ApplicationDialogComponent);
    component = fixture.componentInstance;
    component.data = mockApplication;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card detail with correct data', () => {
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.card-assignee')).toBeTruthy();
    expect(compiled.querySelector('.region')).toBeTruthy();
    expect(compiled.querySelector('.card-active-days').textContent).toContain(`${mockApplication.activeDays}`);
    expect(compiled.querySelector('.card-paused-days').textContent).toContain(`${mockApplication.pausedDays} `);
    expect(compiled.querySelector('.card-comments-wrapper')).toBeTruthy();
  });
});
