import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';

import { IncomingFileService } from '../../services/incoming-file/incoming-file.service';
import { AssigneeDto } from '../../services/user/user.dto';
import { CardType } from '../card/card.component';
import { MeetingOverviewComponent } from './meeting-overview.component';

describe('MeetingOverviewComponent', () => {
  let component: MeetingOverviewComponent;
  let fixture: ComponentFixture<MeetingOverviewComponent>;
  let mockBoardSubject: BehaviorSubject<BoardWithFavourite[]>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockIncomingFileService: DeepMocked<IncomingFileService>;
  let mockUserService: DeepMocked<UserService>;
  let mockMeetingService: DeepMocked<DecisionMeetingService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockBoardSubject = new BehaviorSubject<BoardWithFavourite[]>([]);
    mockBoardService = createMock<BoardService>({
      $boards: mockBoardSubject.asObservable(),
    });
    mockIncomingFileService = createMock();
    mockUserService = createMock();
    mockMeetingService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: DecisionMeetingService,
          useValue: mockMeetingService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: IncomingFileService,
          useValue: mockIncomingFileService,
        },
      ],
      declarations: [MeetingOverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map returned objects into meetings', async () => {
    mockMeetingService.fetch.mockResolvedValue({
      boardCode: [
        {
          boardCode: 'boardCode',
          applicant: 'applicant',
          assignee: {} as AssigneeDto,
          fileNumber: '',
          meetingDate: 0,
          type: CardType.APP,
          isPaused: true,
        },
      ],
    });
    mockIncomingFileService.fetchAndSort.mockResolvedValue({});

    mockBoardSubject.next([
      {
        isFavourite: true,
        title: '',
        code: 'boardCode',
        allowedCardTypes: [],
        showOnSchedule: true,
        hasAssigneeFilter: true,
      },
    ]);

    await component.loadMeetings();
    expect(component.viewData.length).toEqual(1);
  });
});
