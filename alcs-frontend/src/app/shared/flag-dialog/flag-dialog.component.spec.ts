import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationSubmissionStatusService } from '../../services/application/application-submission-status/application-submission-status.service';
import {
  ApplicationDecisionDto,
  ApplicationDecisionWithLinkedResolutionDto,
} from '../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { FlagDialogComponent } from './flag-dialog.component';

describe('FlagDialogComponent', () => {
  let component: FlagDialogComponent;
  let fixture: ComponentFixture<FlagDialogComponent>;
  let mockApplicationDecisionV2Service: DeepMocked<ApplicationDecisionV2Service>;
  let mockSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  beforeEach(async () => {
    mockApplicationDecisionV2Service = createMock();
    mockApplicationDecisionV2Service.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
    mockApplicationDecisionV2Service.$decisions = new BehaviorSubject<ApplicationDecisionWithLinkedResolutionDto[]>([]);
    mockSubmissionStatusService = createMock();

    await TestBed.configureTestingModule({
      declarations: [FlagDialogComponent],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionV2Service,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockSubmissionStatusService,
        },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            fileNumber: '12313',
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
