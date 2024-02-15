import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationBoundaryAmendmentService } from '../../../../services/application/application-boundary-amendments/application-boundary-amendment.service';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';

import { EditBoundaryAmendmentDialogComponent } from './edit-boundary-amendment-dialog.component';

describe('EditBoundaryAmendmentDialogComponent', () => {
  let component: EditBoundaryAmendmentDialogComponent;
  let fixture: ComponentFixture<EditBoundaryAmendmentDialogComponent>;

  let mockBoundaryService: DeepMocked<ApplicationBoundaryAmendmentService>;
  let mockAppDecService: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockBoundaryService = createMock();
    mockAppDecService = createMock();

    await TestBed.configureTestingModule({
      declarations: [EditBoundaryAmendmentDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockAppDecService,
        },
        {
          provide: ApplicationBoundaryAmendmentService,
          useValue: mockBoundaryService,
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditBoundaryAmendmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
