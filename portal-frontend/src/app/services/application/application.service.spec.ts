import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
