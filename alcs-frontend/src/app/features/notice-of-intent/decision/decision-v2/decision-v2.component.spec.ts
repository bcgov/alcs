import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionComponentService } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-component/notice-of-intent-decision-component.service';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionWithLinkedResolutionDto,
} from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionV2Component } from './decision-v2.component';

describe('DecisionV2Component', () => {
  let component: DecisionV2Component;
  let fixture: ComponentFixture<DecisionV2Component>;
  let mockNOIDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;
  let mockNOIDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNOIDecisionComponentService: DeepMocked<NoticeOfIntentDecisionComponentService>;

  beforeEach(async () => {
    mockNOIDecisionService = createMock();
    mockNOIDecisionService.$decision = new BehaviorSubject<NoticeOfIntentDecisionDto | undefined>(undefined);
    mockNOIDecisionService.$decisions = new BehaviorSubject<NoticeOfIntentDecisionWithLinkedResolutionDto[]>([]);

    mockNOIDetailService = createMock();
    mockNOIDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    mockNOIDecisionComponentService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MatMenuModule],
      declarations: [DecisionV2Component],
      providers: [
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNOIDecisionService,
        },
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: NoticeOfIntentDecisionComponentService,
          useValue: mockNOIDecisionComponentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
