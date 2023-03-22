import { TestBed } from '@angular/core/testing';

import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
