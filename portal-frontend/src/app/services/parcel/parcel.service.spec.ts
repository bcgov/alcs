import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../toast/toast.service';

import { ParcelService } from './parcel.service';

describe('ParcelService', () => {
  let service: ParcelService;
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
    service = TestBed.inject(ParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
