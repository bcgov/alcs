import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import {
  ApplicationDecisionDto,
  ApplicationDecisionWithLinkedResolutionDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionConditionsComponent } from './decision-conditions.component';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionsComponent;
  let fixture: ComponentFixture<DecisionConditionsComponent>;
  let mockDecisionService: ApplicationDecisionV2Service;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockDecisionService.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
    mockDecisionService.$decisions = new BehaviorSubject<ApplicationDecisionWithLinkedResolutionDto[]>([]);

    await TestBed.configureTestingModule({
      imports: [MatMenuModule],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      declarations: [DecisionConditionsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionsComponent);
    component = fixture.componentInstance;
    component.codes = {
      ceoCriterion: [],
      decisionComponentTypes: [],
      decisionMakers: [],
      linkedResolutionOutcomeTypes: [],
      naruSubtypes: [],
      outcomes: [],
      decisionConditionTypes: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
