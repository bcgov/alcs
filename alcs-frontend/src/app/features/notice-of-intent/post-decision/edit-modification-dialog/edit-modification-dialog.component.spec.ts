import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoticeOfIntentDecisionService } from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditModificationDialogComponent } from './edit-modification-dialog.component';

describe('EditModificationDialogComponent', () => {
  let component: EditModificationDialogComponent;
  let fixture: ComponentFixture<EditModificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditModificationDialogComponent],
      providers: [
        {
          provide: NoticeOfIntentModificationService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentDecisionService,
          useValue: {},
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
