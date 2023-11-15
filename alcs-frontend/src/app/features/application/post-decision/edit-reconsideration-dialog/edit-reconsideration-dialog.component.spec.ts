import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionService } from '../../../../services/application/decision/application-decision-v1/application-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditReconsiderationDialogComponent } from './edit-reconsideration-dialog.component';

describe('EditReconsiderationDialogComponent', () => {
  let component: EditReconsiderationDialogComponent;
  let fixture: ComponentFixture<EditReconsiderationDialogComponent>;
  let mockDecisionService: DeepMocked<ApplicationDecisionService>;

  beforeEach(async () => {
    mockDecisionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [EditReconsiderationDialogComponent],
      providers: [
        {
          provide: ApplicationReconsiderationService,
          useValue: {},
        },
        {
          provide: ApplicationDecisionService,
          useValue: mockDecisionService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { existingRecon: { type: {}, reconsidersDecisions: [], application: { source: 'fake' } } },
        },
        { provide: MatDialogRef, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReconsiderationDialogComponent);

    mockDecisionService.fetchByApplication.mockResolvedValue([]);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
