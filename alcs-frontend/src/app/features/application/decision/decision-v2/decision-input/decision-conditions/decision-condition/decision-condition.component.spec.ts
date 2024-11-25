import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionConditionComponent } from './decision-condition.component';
import { StartOfDayPipe } from '../../../../../../../shared/pipes/startOfDay.pipe';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionComponent;
  let fixture: ComponentFixture<DecisionConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionComponent, StartOfDayPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionComponent);
    component = fixture.componentInstance;
    component.data = {
      type: {
        code: 'A',
        label: '',
        description: '',
        isAdministrativeFeeAmountChecked: false,
        isSingleDateChecked: false,
        isSecurityAmountChecked: false,
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
