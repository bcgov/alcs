import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ApplicationModificationService } from '../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationReviewService } from '../../../services/application/application-review/application-review.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationDecisionService } from '../../../services/application/decision/application-decision-v1/application-decision.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationDecisionService,
          useValue: {},
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: {},
        },
        {
          provide: ApplicationModificationService,
          useValue: {},
        },
        {
          provide: ApplicationReviewService,
          useValue: {},
        },
        {
          provide: ApplicationMeetingService,
          useValue: {
            fetch: jest.fn(),
          },
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
