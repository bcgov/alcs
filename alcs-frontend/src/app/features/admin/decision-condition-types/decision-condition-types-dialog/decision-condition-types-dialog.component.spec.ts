import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CeoCriterionService } from '../../../../services/ceo-criterion/ceo-criterion.service';
import { ApplicationDecisionConditionTypesService } from '../../../../services/application/application-decision-condition-types/application-decision-condition-types.service';

import { DecisionConditionTypesDialogComponent } from './decision-condition-types-dialog.component';

describe('DecisionConditionTypesDialogComponent', () => {
  let component: DecisionConditionTypesDialogComponent;
  let fixture: ComponentFixture<DecisionConditionTypesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [DecisionConditionTypesDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationDecisionConditionTypesService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionTypesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
