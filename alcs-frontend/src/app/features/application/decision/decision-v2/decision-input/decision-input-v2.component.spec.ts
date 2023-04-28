import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionInputV2Component } from './decision-input-v2.component';

describe('DecisionInputComponent', () => {
  let component: DecisionInputV2Component;
  let fixture: ComponentFixture<DecisionInputV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionInputV2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionInputV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
