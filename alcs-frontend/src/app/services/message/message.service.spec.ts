import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let httpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    httpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClient,
        },
      ],
    });
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for fetchMyNotifications', async () => {
    httpClient.get.mockReturnValue(of([]));

    const res = await service.fetchMyNotifications();

    expect(res).toBeDefined();
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should call post for markRead', async () => {
    httpClient.post.mockReturnValue(of([]));

    const res = await service.markRead('uuid');

    expect(res).toBeDefined();
    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should call post for markAllRead', async () => {
    httpClient.post.mockReturnValue(of([]));

    const res = await service.markAllRead();

    expect(res).toBeDefined();
    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });
});
