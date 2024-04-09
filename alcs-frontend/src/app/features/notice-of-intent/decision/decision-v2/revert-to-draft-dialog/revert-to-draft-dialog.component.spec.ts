import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionWithLinkedResolutionDto } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

import { RevertToDraftDialogComponent } from './revert-to-draft-dialog.component';

describe('RevertToDraftDialogComponent', () => {
  let component: RevertToDraftDialogComponent;
  let fixture: ComponentFixture<RevertToDraftDialogComponent>;
  let mockNOISubStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;
  let mockNOIDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockNOISubStatusService = createMock();
    mockNOIDecisionService = createMock();
    mockNOIDecisionService.$decisions = new BehaviorSubject<NoticeOfIntentDecisionWithLinkedResolutionDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [RevertToDraftDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: NoticeOfIntentSubmissionStatusService, useValue: mockNOISubStatusService },
        { provide: NoticeOfIntentDecisionV2Service, useValue: mockNOIDecisionService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RevertToDraftDialogComponent);
    component = fixture.componentInstance;

    mockNOISubStatusService.fetchSubmissionStatusesByFileNumber.mockResolvedValue([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
