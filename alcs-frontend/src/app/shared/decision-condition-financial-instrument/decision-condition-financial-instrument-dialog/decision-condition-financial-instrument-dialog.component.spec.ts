import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionConditionFinancialInstrumentDialogComponent } from './decision-condition-financial-instrument-dialog.component';

describe('DecisionConditionFinancialInstrumentDialogComponent', () => {
  let component: DecisionConditionFinancialInstrumentDialogComponent;
  let fixture: ComponentFixture<DecisionConditionFinancialInstrumentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionFinancialInstrumentDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecisionConditionFinancialInstrumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
