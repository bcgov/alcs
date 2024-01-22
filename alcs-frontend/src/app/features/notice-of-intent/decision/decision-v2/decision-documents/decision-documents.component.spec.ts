import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionDto } from '../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { ToastService } from '../../../../../services/toast/toast.service';

import { DecisionDocumentsComponent } from './decision-documents.component';

describe('DecisionDocumentsComponent', () => {
  let component: DecisionDocumentsComponent;
  let fixture: ComponentFixture<DecisionDocumentsComponent>;
  let mockNOIDecService: DeepMocked<NoticeOfIntentDecisionV2Service>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockNOIDecService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockNOIDecService.$decision = new BehaviorSubject<NoticeOfIntentDecisionDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [DecisionDocumentsComponent],
      providers: [
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNOIDecService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
