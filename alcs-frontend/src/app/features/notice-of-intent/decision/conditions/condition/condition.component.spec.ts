import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDecisionConditionService } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { ConditionComponentLabels, DecisionConditionWithStatus } from '../conditions.component';

import { ConditionComponent } from './condition.component';

describe('ConditionComponent', () => {
  let component: ConditionComponent;
  let fixture: ComponentFixture<ConditionComponent>;
  let mockNOIDecisionConditionService: DeepMocked<NoticeOfIntentDecisionConditionService>;

  beforeEach(async () => {
    mockNOIDecisionConditionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConditionComponent],
      providers: [
        {
          provide: NoticeOfIntentDecisionConditionService,
          useValue: mockNOIDecisionConditionService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [SharedModule, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionComponent);
    component = fixture.componentInstance;

    component.condition = createMock<
      DecisionConditionWithStatus & {
        componentLabelsStr?: string;
        componentLabels?: ConditionComponentLabels[];
      }
    >();
    component.condition.conditionComponentsLabels = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
