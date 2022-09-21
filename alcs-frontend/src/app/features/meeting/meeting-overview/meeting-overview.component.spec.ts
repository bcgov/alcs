import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { BoardService } from '../../../services/board/board.service';
import { DecisionMeetingService } from '../../../services/decision-meeting/decision-meeting.service';

import { MeetingOverviewComponent } from './meeting-overview.component';

describe('MeetingOverviewComponent', () => {
  let component: MeetingOverviewComponent;
  let fixture: ComponentFixture<MeetingOverviewComponent>;

  beforeEach(async () => {
    const mockBoardService = jasmine.createSpyObj<BoardService>('BoardService', ['fetchApplications']);
    mockBoardService.$boards = new BehaviorSubject([]);

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
          provide: ApplicationDocumentService,
          useValue: {},
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
