import { TestBed } from '@angular/core/testing';

import { FileTagService } from './file-tag.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';

describe('FileTagService', () => {
  let service: FileTagService;
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
    service = TestBed.inject(FileTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
