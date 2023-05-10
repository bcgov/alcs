import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionConditionsComponent } from './decision-conditions.component';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionsComponent;
  let fixture: ComponentFixture<DecisionConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
