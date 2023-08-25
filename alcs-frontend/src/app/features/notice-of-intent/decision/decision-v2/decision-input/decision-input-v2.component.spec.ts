import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDetailService } from '../../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationService } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { StartOfDayPipe } from '../../../../../shared/pipes/startOfDay.pipe';

import { DecisionInputV2Component } from './decision-input-v2.component';

describe('DecisionInputComponent', () => {
  let component: DecisionInputV2Component;
  let fixture: ComponentFixture<DecisionInputV2Component>;
  let mockNoticeOfIntentDecisionV2Service: DeepMocked<NoticeOfIntentDecisionV2Service>;
  let mockNoticeOfIntentModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockNoticeOfIntentDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockRouter: DeepMocked<Router>;
  let mockToastService: DeepMocked<ToastService>;
  let mockMatDialog: DeepMocked<MatDialog>;

  beforeEach(async () => {
    mockNoticeOfIntentDecisionV2Service = createMock();
    mockNoticeOfIntentModificationService = createMock();
    mockToastService = createMock();
    mockRouter = createMock();
    mockRouter.navigateByUrl.mockResolvedValue(true);
    mockMatDialog = createMock();
    mockNoticeOfIntentDetailService = createMock();

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DecisionInputV2Component, StartOfDayPipe],
      providers: [
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNoticeOfIntentDecisionV2Service,
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockNoticeOfIntentModificationService,
        },
        { provide: NoticeOfIntentDetailService, useValue: mockNoticeOfIntentDetailService },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ uuid: 'fake' }),
            },
          },
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionInputV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
