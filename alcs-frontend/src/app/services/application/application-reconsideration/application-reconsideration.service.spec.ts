import { TestBed } from '@angular/core/testing';

import { ApplicationReconsiderationService } from './application-reconsideration.service';

describe('ApplicationReconsiderationService', () => {
  let service: ApplicationReconsiderationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationReconsiderationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
