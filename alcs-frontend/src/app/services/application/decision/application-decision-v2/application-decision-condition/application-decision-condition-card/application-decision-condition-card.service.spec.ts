import { TestBed } from '@angular/core/testing';

import { ApplicationDecisionConditionCardService } from './application-decision-condition-card.service';
import { HttpClient } from '@angular/common/http';
import { DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../../../../../toast/toast.service';

describe('ApplicationDecisionConditionCardService', () => {
  let service: ApplicationDecisionConditionCardService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(() => {
    mockHttpClient = {} as DeepMocked<HttpClient>;
    mockToastService = {} as DeepMocked<ToastService>;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
    });
    service = TestBed.inject(ApplicationDecisionConditionCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
