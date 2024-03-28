import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PlanningReviewDecisionService } from '../../../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { ToastService } from '../../../../../services/toast/toast.service';

import { DecisionDocumentUploadDialogComponent } from './decision-document-upload-dialog.component';

describe('DecisionDocumentUploadDialogComponent', () => {
  let component: DecisionDocumentUploadDialogComponent;
  let fixture: ComponentFixture<DecisionDocumentUploadDialogComponent>;

  let mockPRDecService: DeepMocked<PlanningReviewDecisionService>;

  beforeEach(async () => {
    mockPRDecService = createMock();

    const mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
      subscribe: jest.fn(),
      backdropClick: () => new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      declarations: [DecisionDocumentUploadDialogComponent],
      providers: [
        {
          provide: PlanningReviewDecisionService,
          useValue: mockPRDecService,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ToastService, useValue: {} },
      ],
      imports: [MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDocumentUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
