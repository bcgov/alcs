import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDetailService } from './notice-of-intent-detail.service';
import { NoticeOfIntentDto } from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentDetailService', () => {
  let service: NoticeOfIntentDetailService;
  let noticeOfIntentService: DeepMocked<NoticeOfIntentService>;

  beforeEach(() => {
    noticeOfIntentService = createMock();

    TestBed.configureTestingModule({
      providers: [
        NoticeOfIntentDetailService,
        {
          provide: NoticeOfIntentService,
          useValue: noticeOfIntentService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(NoticeOfIntentDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish the loaded noi', async () => {
    noticeOfIntentService.fetchByFileNumber.mockResolvedValue({
      fileNumber: '1',
    } as NoticeOfIntentDto);

    await service.load('1');
    const res = await firstValueFrom(service.$noticeOfIntent);

    expect(noticeOfIntentService.fetchByFileNumber).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should publish the updated noi for update', async () => {
    noticeOfIntentService.update.mockResolvedValue({
      fileNumber: '1',
    } as NoticeOfIntentDto);

    await service.update('1', {});
    const res = await firstValueFrom(service.$noticeOfIntent);

    expect(noticeOfIntentService.update).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });
});
