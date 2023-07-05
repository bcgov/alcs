import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDecisionConditionService } from '../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import { ApplicationDecisionConditionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { SharedModule } from '../../../../../shared/shared.module';

import { ConditionComponent } from './condition.component';

describe('ConditionComponent', () => {
  let component: ConditionComponent;
  let fixture: ComponentFixture<ConditionComponent>;
  let mockApplicationDecisionConditionService: DeepMocked<ApplicationDecisionConditionService>;

  beforeEach(async () => {
    mockApplicationDecisionConditionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConditionComponent],
      providers: [
        {
          provide: ApplicationDecisionConditionService,
          useValue: mockApplicationDecisionConditionService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [SharedModule, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionComponent);
    component = fixture.componentInstance;

    component.condition = createMock<ApplicationDecisionConditionDto>();
    component.condition.conditionComponentsLabels = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
