import { TestBed } from '@angular/core/testing';

import { ApplicationTagService } from './application-tag.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast/toast.service';

describe('ApplicationTagService', () => {
  let service: ApplicationTagService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  beforeEach(() => {
    httpClient = createMock();
    toastService = createMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClient },
        {
          provide: ToastService,
          useValue: toastService,
        },
      ],
    });
    service = TestBed.inject(ApplicationTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
