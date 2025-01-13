import { TestBed } from '@angular/core/testing';

import { ApplicationDecisionConditionCardService } from './application-decision-condition-card.service';

describe('ApplicationDecisionConditionCardService', () => {
  let service: ApplicationDecisionConditionCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationDecisionConditionCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
