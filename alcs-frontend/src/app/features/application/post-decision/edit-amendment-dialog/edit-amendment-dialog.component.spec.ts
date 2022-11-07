import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationAmendmentService } from '../../../../services/application/application-amendment/application-amendment.service';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditAmendmentDialogComponent } from './edit-amendment-dialog.component';

describe('EditAmendmentDialogComponent', () => {
  let component: EditAmendmentDialogComponent;
  let fixture: ComponentFixture<EditAmendmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditAmendmentDialogComponent],
      providers: [
        {
          provide: ApplicationAmendmentService,
          useValue: {},
        },
        {
          provide: ApplicationDecisionService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { existingAmendment: { submittedDate: 121231, amendedDecisions: [] } } },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAmendmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
