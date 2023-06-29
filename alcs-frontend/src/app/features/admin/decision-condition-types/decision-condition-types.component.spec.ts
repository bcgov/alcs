import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DecisionConditionTypesService } from '../../../services/decision-condition-types/decision-condition-types.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionConditionTypesComponent } from './decision-condition-types.component';

describe('DecisionConditionTypesComponent', () => {
  let component: DecisionConditionTypesComponent;
  let fixture: ComponentFixture<DecisionConditionTypesComponent>;
  let mockDecTypesService: DeepMocked<DecisionConditionTypesService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockDecTypesService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DecisionConditionTypesComponent],
      providers: [
        {
          provide: DecisionConditionTypesService,
          useValue: mockDecTypesService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockConfirmationDialogService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionTypesComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
