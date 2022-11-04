import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastService } from '../toast/toast.service';

import { CovenantService } from './covenant.service';

describe('CovenantService', () => {
  let service: CovenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ToastService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(CovenantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
