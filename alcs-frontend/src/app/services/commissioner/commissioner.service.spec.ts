import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommissionerService } from './commissioner.service';

describe('CommissionerService', () => {
  let service: CommissionerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CommissionerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
