import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MaintenanceInterceptorService } from './maintenance-interceptor.service';

describe('MaintenanceInterceptorService', () => {
  let service: MaintenanceInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaintenanceInterceptorService],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    });
    service = TestBed.inject(MaintenanceInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
