import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MaintenanceInterceptorService } from './maintenance-interceptor.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MaintenanceInterceptorService', () => {
  let service: MaintenanceInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [MaintenanceInterceptorService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(MaintenanceInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
