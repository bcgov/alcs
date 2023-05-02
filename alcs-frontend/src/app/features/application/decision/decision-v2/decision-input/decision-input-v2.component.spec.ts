import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { StartOfDayPipe } from '../../../../../shared/pipes/startOfDay.pipe';

import { DecisionInputV2Component } from './decision-input-v2.component';

describe('DecisionInputComponent', () => {
  let component: DecisionInputV2Component;
  let fixture: ComponentFixture<DecisionInputV2Component>;
  let mockApplicationDecisionV2Service: DeepMocked<ApplicationDecisionV2Service>;
  let mockApplicationReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockApplicationModificationService: DeepMocked<ApplicationModificationService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockApplicationDecisionV2Service = createMock();
    mockApplicationReconsiderationService = createMock();
    mockApplicationModificationService = createMock();

    mockRouter = createMock();
    mockRouter.navigateByUrl.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DecisionInputV2Component, StartOfDayPipe],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionV2Service,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockApplicationReconsiderationService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockApplicationModificationService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ uuid: 'fake' }),
            },
          },
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionInputV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
