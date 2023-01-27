import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../toast/toast.service';

import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
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
    service = TestBed.inject(CommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch comments by card uuid', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    const res = await service.fetchComments('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('1');
  });

  it('should create a comment', async () => {
    httpClient.post.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.createComment({ body: '', cardUuid: '', mentions: new Map(), notificationTitle: '' });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should update a comment', async () => {
    httpClient.patch.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.updateComment({ body: '', mentions: new Map(), uuid: '', notificationTitle: '' });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should delete a comment', async () => {
    httpClient.delete.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.deleteComment('');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });
});
