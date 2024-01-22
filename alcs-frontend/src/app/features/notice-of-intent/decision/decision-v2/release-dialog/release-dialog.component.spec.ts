import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionDto } from '../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { ReleaseDialogComponent } from './release-dialog.component';

describe('ReleaseDialogComponent', () => {
  let component: ReleaseDialogComponent;
  let fixture: ComponentFixture<ReleaseDialogComponent>;
  let mockNOISubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;
  let mockNOIDecisionV2Service: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockNOISubmissionStatusService = createMock();
    mockNOIDecisionV2Service = createMock();
    mockNOIDecisionV2Service.$decision = new BehaviorSubject<NoticeOfIntentDecisionDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [ReleaseDialogComponent],
      providers: [
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNOISubmissionStatusService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNOIDecisionV2Service,
        },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
