import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { CardStatusService } from './card-status.service';

describe('CardStatusService', () => {
  let service: CardStatusService;
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
    service = TestBed.inject(CardStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call post on create', async () => {
    mockHttpClient.post.mockReturnValue(
      of({
        code: 'fake',
      })
    );

    const res = await service.create({
      code: '',
      label: '',
      description: '',
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.code).toEqual('fake');
  });

  it('should show toast if create fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.create({
      code: '',
      label: '',
      description: '',
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call patch on update', async () => {
    mockHttpClient.patch.mockReturnValue(
      of({
        code: 'fake',
      })
    );

    const res = await service.update('fake', {
      code: '',
      label: '',
      description: '',
    });

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.code).toEqual('fake');
  });

  it('should show toast if update fails', async () => {
    mockHttpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.update('mock', {
      code: '',
      label: '',
      description: '',
    });

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get on fetch', async () => {
    mockHttpClient.get.mockReturnValue(of([]));

    await service.fetch();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should show toast if get fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.fetch();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call delete on delete', async () => {
    mockHttpClient.delete.mockReturnValue(
      of({
        code: 'fake',
      })
    );

    const res = await service.delete('fake');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.code).toEqual('fake');
  });

  it('should show toast if delete fails', async () => {
    mockHttpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.delete('mock');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
