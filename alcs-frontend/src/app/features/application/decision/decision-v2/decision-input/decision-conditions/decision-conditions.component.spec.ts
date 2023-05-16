import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDecisionDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';

import { DecisionConditionsComponent } from './decision-conditions.component';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionsComponent;
  let fixture: ComponentFixture<DecisionConditionsComponent>;
  let mockDecisionService: ApplicationDecisionV2Service;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockDecisionService.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
    mockDecisionService.$decisions = new BehaviorSubject<ApplicationDecisionDto[] | []>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockDecisionService,
        },
      ],
      declarations: [DecisionConditionsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
