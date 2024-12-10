import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionConditionComponent } from './decision-condition.component';
import { StartOfDayPipe } from '../../../../../../../shared/pipes/startOfDay.pipe';
import { DateType } from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionComponent;
  let fixture: ComponentFixture<DecisionConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionComponent, StartOfDayPipe],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionComponent);
    component = fixture.componentInstance;
    component.data = {
      type: {
        code: '',
        label: '',
        description: '',
        isActive: true,
        isAdministrativeFeeAmountChecked: false,
        isDateChecked: false,
        isDateRequired: false,
        dateType: DateType.SINGLE,
        isSecurityAmountChecked: false,
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
