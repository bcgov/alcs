import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';

import { ConditionsComponent } from './conditions.component';

describe('ConditionsComponent', () => {
  let component: ConditionsComponent;
  let fixture: ComponentFixture<ConditionsComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockApplicationDecisionV2Service: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    mockApplicationDecisionV2Service = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConditionsComponent],
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionV2Service,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ uuid: 'fake' }),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
