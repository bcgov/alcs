import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../services/application/application-modification/application-modification.service';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationReviewService } from '../../services/application/application-review/application-review.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ApplicationSubmissionService } from '../../services/application/application-submission/application-submission.service';
import { ApplicationSubmissionStatusService } from '../../services/application/application-submission-status/application-submission-status.service';

import { ApplicationComponent } from './application.component';
import { ApplicationDecisionConditionCardService } from '../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';

describe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockReviewService: DeepMocked<ApplicationReviewService>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockAppStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockApplicationDecisionConditionCardService: DeepMocked<ApplicationDecisionConditionCardService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    mockReconsiderationService = createMock();
    mockReconsiderationService.$reconsiderations = new BehaviorSubject<ApplicationReconsiderationDto[]>([]);

    mockModificationService = createMock();
    mockModificationService.$modifications = new BehaviorSubject<ApplicationModificationDto[]>([]);

    mockReviewService = createMock();
    mockAppSubmissionService = createMock();
    mockAppStatusService = createMock();

    mockApplicationDecisionConditionCardService = createMock();
    mockApplicationDecisionConditionCardService.$conditionCards = new BehaviorSubject<any>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ApplicationReviewService,
          useValue: mockReviewService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockAppStatusService,
        },
        {
          provide: ApplicationDecisionConditionCardService,
          useValue: mockApplicationDecisionConditionCardService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new EventEmitter(),
          },
        },
        {
          provide: Router,
          useValue: {},
        },
      ],
      declarations: [ApplicationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
