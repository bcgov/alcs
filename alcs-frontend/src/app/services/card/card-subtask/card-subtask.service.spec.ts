import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { CardSubtaskService } from './card-subtask.service';

describe('CommentService', () => {
  let service: CardSubtaskService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  beforeEach(() => {
    httpClient = createMock();
    toastService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClient,
        },
        {
          provide: ToastService,
          useValue: toastService,
        },
      ],
    });
    service = TestBed.inject(CardSubtaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch subtasks by card uuid', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    const res = await service.fetch('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('1');
  });

  it('should create subtasks', async () => {
    httpClient.post.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.create('1', 'type');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.create('1', 'type');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should update subtasks', async () => {
    httpClient.patch.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.update('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should delete subtasks', async () => {
    httpClient.delete.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.delete('1');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });
});
