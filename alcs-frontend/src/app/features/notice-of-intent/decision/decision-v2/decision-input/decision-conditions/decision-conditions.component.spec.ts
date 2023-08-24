import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionWithLinkedResolutionDto,
} from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionConditionsComponent } from './decision-conditions.component';

describe('DecisionConditionComponent', () => {
  let component: DecisionConditionsComponent;
  let fixture: ComponentFixture<DecisionConditionsComponent>;
  let mockDecisionService: NoticeOfIntentDecisionV2Service;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockDecisionService.$decision = new BehaviorSubject<NoticeOfIntentDecisionDto | undefined>(undefined);
    mockDecisionService.$decisions = new BehaviorSubject<NoticeOfIntentDecisionWithLinkedResolutionDto[]>([]);

    await TestBed.configureTestingModule({
      imports: [MatMenuModule],
      providers: [
        {
          provide: NoticeOfIntentDecisionV2Service,
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
      decisionComponentTypes: [],
      outcomes: [],
      decisionConditionTypes: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
