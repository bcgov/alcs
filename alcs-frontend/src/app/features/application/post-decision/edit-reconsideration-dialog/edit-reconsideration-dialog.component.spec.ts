import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditReconsiderationDialogComponent } from './edit-reconsideration-dialog.component';

describe('EditReconsiderationDialogComponent', () => {
  let component: EditReconsiderationDialogComponent;
  let fixture: ComponentFixture<EditReconsiderationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReconsiderationDialogComponent],
      providers: [
        {
          provide: ApplicationReconsiderationService,
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
        { provide: MAT_DIALOG_DATA, useValue: { existingDecision: { type: {}, reconsideredDecisions: [] } } },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReconsiderationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
