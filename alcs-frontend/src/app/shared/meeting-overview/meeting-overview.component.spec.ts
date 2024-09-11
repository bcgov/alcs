import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { sleep } from '../../../../test/sleep';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';
import { AssigneeDto, UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { CardType } from '../card/card.component';
import { RouterTestingModule } from '@angular/router/testing';

import { MeetingOverviewComponent } from './meeting-overview.component';
import { IncomingFileService } from '../../services/incoming-file/incoming-file.service';

describe('MeetingOverviewComponent', () => {
  let component: MeetingOverviewComponent;
  let fixture: ComponentFixture<MeetingOverviewComponent>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockIncomingFileService: DeepMocked<IncomingFileService>;
  let boardEmitter: BehaviorSubject<BoardWithFavourite[]>;
  let mockUserService: DeepMocked<UserService>;
  let mockMeetingService: DeepMocked<DecisionMeetingService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockBoardService = createMock();
    mockIncomingFileService = createMock();
    boardEmitter = new BehaviorSubject<BoardWithFavourite[]>([]);
    mockBoardService.$boards = boardEmitter;

    mockUserService = createMock();
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>(undefined);

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
        },
      ],
    });

    boardEmitter.next([
      {
        isFavourite: true,
        title: '',
        code: 'boardCode',
        allowedCardTypes: [],
        showOnSchedule: true,
      },
    ]);

    await sleep(1);
    await component.loadMeetings();
    expect(component.viewData.length).toEqual(1);
  });
});
