import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditModificationDialogComponent } from './edit-modification-dialog.component';

describe('EditModificationDialogComponent', () => {
  let component: EditModificationDialogComponent;
  let fixture: ComponentFixture<EditModificationDialogComponent>;
  let mockDecisionService: DeepMocked<ApplicationDecisionV2Service>;

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
          provide: ApplicationDecisionV2Service,
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
