import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionService } from '../../../../services/application/decision/application-decision-v1/application-decision.service';
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReconsiderationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
