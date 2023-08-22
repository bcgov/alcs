import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionService } from '../../../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentDto } from '../../../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionComponentsComponent } from './decision-components.component';

describe('DecisionComponentsComponent', () => {
  let component: DecisionComponentsComponent;
  let fixture: ComponentFixture<DecisionComponentsComponent>;
  let mockNoticeOfIntentDecisionV2Service: DeepMocked<NoticeOfIntentDecisionV2Service>;
  let mockToastService: DeepMocked<ToastService>;
  let mockNoticeOfIntentDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;

  beforeEach(async () => {
    mockNoticeOfIntentDecisionV2Service = createMock();
    mockNoticeOfIntentDecisionV2Service.$decision = new BehaviorSubject<NoticeOfIntentDecisionDto | undefined>(
      undefined
    );

    mockToastService = createMock();
    mockNoticeOfIntentDetailService = createMock();
    mockNoticeOfIntentDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    mockNoticeOfIntentSubmissionService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [DecisionComponentsComponent],
      providers: [
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNoticeOfIntentDecisionV2Service,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNoticeOfIntentDetailService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
