import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ReturnApplicationDialogComponent } from './return-application-dialog.component';

describe('ReturnApplicationDialogComponent', () => {
  let component: ReturnApplicationDialogComponent;
  let fixture: ComponentFixture<ReturnApplicationDialogComponent>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;

  beforeEach(async () => {
    mockAppReviewService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        { provide: MAT_DIALOG_DATA, useValue: { fileId: 'fake' } },
      ],
      declarations: [ReturnApplicationDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnApplicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
