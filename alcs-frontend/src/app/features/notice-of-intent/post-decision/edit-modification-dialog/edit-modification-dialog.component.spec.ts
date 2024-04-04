import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditModificationDialogComponent } from './edit-modification-dialog.component';

describe('EditModificationDialogComponent', () => {
  let component: EditModificationDialogComponent;
  let fixture: ComponentFixture<EditModificationDialogComponent>;
  let mockDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockDecisionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [EditModificationDialogComponent],
      providers: [
        {
          provide: NoticeOfIntentModificationService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            existingModification: { submittedDate: 121231, modifiesDecisions: [], reviewOutcome: { code: 'mock' } },
          },
        },
        { provide: MatDialogRef, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditModificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
