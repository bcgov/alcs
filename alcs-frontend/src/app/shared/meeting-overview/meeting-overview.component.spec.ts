import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';
import { BoardService } from '../../services/board/board.service';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';
import { AssigneeDto, UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

import { MeetingOverviewComponent } from './meeting-overview.component';

describe('MeetingOverviewComponent', () => {
  let component: MeetingOverviewComponent;
  let fixture: ComponentFixture<MeetingOverviewComponent>;

  beforeEach(async () => {
    const mockBoardService = jasmine.createSpyObj<BoardService>('BoardService', ['fetchCards']);
    mockBoardService.$boards = new BehaviorSubject([]);

    const mockUserService = jasmine.createSpyObj<UserService>('UserService', ['fetchAssignableUsers']);
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: DecisionMeetingService,
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
          provide: ApplicationDocumentService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      declarations: [MeetingOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
