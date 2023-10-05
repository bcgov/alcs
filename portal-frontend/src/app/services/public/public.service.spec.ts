import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { PublicService } from './public.service';

describe('PublicService', () => {
  let service: PublicService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(() => {
    mockHttpClient = createMock();
    mockToastService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
    });
    service = TestBed.inject(PublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for loading applications', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getApplication('fileId');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should call get for loading application files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getApplicationFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });
});
