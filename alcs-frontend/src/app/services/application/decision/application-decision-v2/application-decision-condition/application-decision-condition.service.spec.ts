import { TestBed } from '@angular/core/testing';

import { ApplicationDecisionConditionService } from './application-decision-condition.service';

describe('ApplicationDecisionConditionService', () => {
  let service: ApplicationDecisionConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationDecisionConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
