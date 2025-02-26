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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApplicationDecisionConditionService } from '../../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionsComponent;
  let fixture: ComponentFixture<DecisionConditionsComponent>;
  let mockDecisionService: ApplicationDecisionV2Service;
  let mockConditionService: ApplicationDecisionConditionService;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockConditionService = createMock();
    mockDecisionService.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
    mockDecisionService.$decisions = new BehaviorSubject<ApplicationDecisionWithLinkedResolutionDto[]>([]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatMenuModule],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ApplicationDecisionConditionService,
          useValue: mockConditionService,
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
    component.types = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
