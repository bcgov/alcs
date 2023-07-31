import { TestBed } from '@angular/core/testing';

import { ApplicationDecisionComponentToConditionLotService } from './application-decision-component-to-condition-lot.service';

describe('ApplicationDecisionComponentToConditionLotService', () => {
  let service: ApplicationDecisionComponentToConditionLotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationDecisionComponentToConditionLotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
