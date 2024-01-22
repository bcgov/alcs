import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { ApplicationDecisionService } from '../../../../services/application/decision/application-decision-v1/application-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditModificationDialogComponent } from './edit-modification-dialog.component';

describe('EditModificationDialogComponent', () => {
  let component: EditModificationDialogComponent;
  let fixture: ComponentFixture<EditModificationDialogComponent>;
  let mockDecisionService: DeepMocked<ApplicationDecisionService>;

  beforeEach(async () => {
    mockDecisionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [EditModificationDialogComponent],
      providers: [
        {
          provide: ApplicationModificationService,
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

    mockDecisionService.fetchByApplication.mockResolvedValue({} as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
