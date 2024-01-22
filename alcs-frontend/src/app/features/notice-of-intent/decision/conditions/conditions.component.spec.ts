import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';

import { ConditionsComponent } from './conditions.component';

describe('ConditionsComponent', () => {
  let component: ConditionsComponent;
  let fixture: ComponentFixture<ConditionsComponent>;
  let mockNOIDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNOIV2DecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockNOIDetailService = createMock();
    mockNOIDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    mockNOIV2DecisionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConditionsComponent],
      providers: [
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNOIV2DecisionService,
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
