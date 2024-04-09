import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationSubmissionStatusService } from '../../../../../services/application/application-submission-status/application-submission-status.service';
import { ApplicationDecisionWithLinkedResolutionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';

import { RevertToDraftDialogComponent } from './revert-to-draft-dialog.component';

describe('RevertToDraftDialogComponent', () => {
  let component: RevertToDraftDialogComponent;
  let fixture: ComponentFixture<RevertToDraftDialogComponent>;
  let mockAppSubStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockAppDecService: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockAppSubStatusService = createMock();
    mockAppDecService = createMock();
    mockAppDecService.$decisions = new BehaviorSubject<ApplicationDecisionWithLinkedResolutionDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [RevertToDraftDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: ApplicationSubmissionStatusService, useValue: mockAppSubStatusService },
        { provide: ApplicationDecisionV2Service, useValue: mockAppDecService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RevertToDraftDialogComponent);
    component = fixture.componentInstance;

    mockAppSubStatusService.fetchSubmissionStatusesByFileNumber.mockResolvedValue([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
