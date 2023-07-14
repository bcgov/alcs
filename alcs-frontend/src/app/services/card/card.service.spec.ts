import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { CardType } from '../../shared/card/card.component';
import { ToastService } from '../toast/toast.service';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
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
    service = TestBed.inject(CardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update a card', async () => {
    httpClient.patch.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.updateCard({
      assigneeUuid: undefined,
      boardCode: '',
      highPriority: false,
      statusCode: '',
      typeCode: CardType.APP,
      uuid: '',
    });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if update card fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.updateCard({
      assigneeUuid: undefined,
      boardCode: '',
      highPriority: false,
      statusCode: '',
      typeCode: CardType.NOI_MODI,
      uuid: '',
    });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch and publish codes', async () => {
    httpClient.get.mockReturnValue(
      of({
        reconsiderationType: [
          {
            code: 'code',
          },
        ],
      })
    );

    await service.fetchCodes();
    const res = await firstValueFrom(service.$cardReconTypes);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].code).toEqual('code');
  });
});
