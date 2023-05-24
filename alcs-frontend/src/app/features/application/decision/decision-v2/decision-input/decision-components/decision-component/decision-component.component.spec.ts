import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionComponentComponent } from './decision-component.component';

describe('DecisionComponentComponent', () => {
  let component: DecisionComponentComponent;
  let fixture: ComponentFixture<DecisionComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionComponentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponentComponent);
    component = fixture.componentInstance;
    component.data = { applicationDecisionComponentTypeCode: '' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
