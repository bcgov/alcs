import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UnauthorizedInterceptor } from './unauthorized.interceptor';

describe('UnauthorizedInterceptor', () => {
  let service: UnauthorizedInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UnauthorizedInterceptor,
        {
          provide: Router,
          useValue: {},
        },
      ],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UnauthorizedInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
