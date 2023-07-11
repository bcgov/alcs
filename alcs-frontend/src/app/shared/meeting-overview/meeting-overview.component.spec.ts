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

import { MeetingOverviewComponent } from './meeting-overview.component';

describe('MeetingOverviewComponent', () => {
  let component: MeetingOverviewComponent;
  let fixture: ComponentFixture<MeetingOverviewComponent>;
  let mockBoardService: DeepMocked<BoardService>;
  let boardEmitter: BehaviorSubject<BoardWithFavourite[]>;
  let mockUserService: DeepMocked<UserService>;
  let mockMeetingService: DeepMocked<DecisionMeetingService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockBoardService = createMock();
    boardEmitter = new BehaviorSubject<BoardWithFavourite[]>([]);
    mockBoardService.$boards = boardEmitter;

    mockUserService = createMock();
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    mockMeetingService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
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
        },
      ],
    });

    boardEmitter.next([
      {
        statuses: [],
        isFavourite: true,
        title: '',
        code: 'boardCode',
        allowedCardTypes: [],
        createCardTypes: [],
      },
    ]);

    await sleep(1);
    await component.loadMeetings();
    expect(component.viewData.length).toEqual(1);
  });

  it('should show an error toast if searched application is not found', async () => {
    await sleep(1);

    component.searchText = '5555';
    component.onSearch();

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
