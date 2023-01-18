import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ToastService } from '../toast/toast.service';

import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(ApplicationParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
