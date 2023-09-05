import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionService } from '../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentTimelineService } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';

import { OverviewComponent } from './overview.component';
import { NoticeOfIntentSubmissionStatusService } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let mockNOIDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNOIDecisionService: DeepMocked<NoticeOfIntentDecisionService>;

  beforeEach(async () => {
    mockNOIDecisionService = createMock();

    mockNOIDetailService = createMock();
    mockNOIDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: NoticeOfIntentTimelineService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: {},
        },
      ],
      declarations: [OverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
