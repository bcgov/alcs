import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DecisionConditionFinancialInstrumentDialogComponent } from './decision-condition-financial-instrument-dialog.component';

describe('DecisionConditionFinancialInstrumentDialogComponent', () => {
  let component: DecisionConditionFinancialInstrumentDialogComponent;
  let fixture: ComponentFixture<DecisionConditionFinancialInstrumentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionFinancialInstrumentDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionFinancialInstrumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
