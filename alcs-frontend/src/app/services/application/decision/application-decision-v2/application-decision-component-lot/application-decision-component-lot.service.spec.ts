import { TestBed } from '@angular/core/testing';

import { ApplicationDecisionComponentLotService } from './application-decision-component-lot.service';

describe('ApplicationDecisionComponentLotService', () => {
  let service: ApplicationDecisionComponentLotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationDecisionComponentLotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
