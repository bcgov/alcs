import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionConditionFinancialInstrumentComponent } from './decision-condition-financial-instrument.component';

describe('DecisionConditionFinancialInstrumentComponent', () => {
  let component: DecisionConditionFinancialInstrumentComponent;
  let fixture: ComponentFixture<DecisionConditionFinancialInstrumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionFinancialInstrumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecisionConditionFinancialInstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
