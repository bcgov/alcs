import { TestBed } from '@angular/core/testing';

import { ApplicationTagService } from './application-tag.service';

describe('ApplicationTagService', () => {
  let service: ApplicationTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
