import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { NoticeOfIntentDecisionConditionCardService } from './notice-of-intent-decision-condition-card.service';
import { ToastService } from '../../../../toast/toast.service';
import {
  CreateNoticeOfIntentDecisionConditionCardDto,
  NoticeOfIntentDecisionConditionCardBoardDto,
  NoticeOfIntentDecisionConditionCardDto,
  UpdateNoticeOfIntentDecisionConditionCardDto,
} from '../../notice-of-intent-decision.dto';

describe('NoticeOfIntentDecisionConditionCardService', () => {
  let service: NoticeOfIntentDecisionConditionCardService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(() => {
    mockHttpClient = createMock<HttpClient>();
    mockToastService = createMock<ToastService>();

    TestBed.configureTestingModule({
      providers: [
        NoticeOfIntentDecisionConditionCardService,
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
    service = TestBed.inject(NoticeOfIntentDecisionConditionCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a NOI Decision Condition Card by uuid', async () => {
    const mockResponse = {} as NoticeOfIntentDecisionConditionCardDto;
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    const result = await service.get('uuid');
    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${service['url']}/uuid`);
  });

  it('should handle error when fetching a NOI Decision Condition Card by uuid', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => new Error('Error')));

    const result = await service.get('uuid');
    expect(result).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to fetch NOI Decision Condition Card');
  });

  it('should create a NOI Decision Condition Card', async () => {
    const mockDto = {} as CreateNoticeOfIntentDecisionConditionCardDto;
    const mockResponse = {} as NoticeOfIntentDecisionConditionCardDto;
    mockHttpClient.post.mockReturnValue(of(mockResponse));

    const result = await service.create(mockDto);
    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.post).toHaveBeenCalledWith(service['url'], mockDto);
  });

  it('should handle error when creating a NOI Decision Condition Card', async () => {
    const mockDto = {} as CreateNoticeOfIntentDecisionConditionCardDto;
    mockHttpClient.post.mockReturnValue(throwError(() => new Error('Error')));

    const result = await service.create(mockDto);
    expect(result).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to create NOI Decision Condition Card');
  });

  it('should update a NOI Decision Condition Card', async () => {
    const mockDto = {} as UpdateNoticeOfIntentDecisionConditionCardDto;
    const mockResponse = {} as NoticeOfIntentDecisionConditionCardDto;
    mockHttpClient.patch.mockReturnValue(of(mockResponse));

    const result = await service.update('uuid', mockDto);
    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${service['url']}/uuid`, mockDto);
  });

  it('should handle error when updating a NOI Decision Condition Card', async () => {
    const mockDto = {} as UpdateNoticeOfIntentDecisionConditionCardDto;
    mockHttpClient.patch.mockReturnValue(throwError(() => new Error('Error')));

    const result = await service.update('uuid', mockDto);
    expect(result).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to update NOI Decision Condition Card');
  });

  it('should fetch a NOI Decision Condition Card by card uuid', async () => {
    const mockResponse = {} as NoticeOfIntentDecisionConditionCardBoardDto;
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    const result = await service.getByCard('uuid');
    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${service['url']}/board-card/uuid`);
  });

  it('should handle error when fetching a NOI Decision Condition Card by card uuid', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => new Error('Error')));

    const result = await service.getByCard('uuid');
    expect(result).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to fetch NOI Decision Condition Card by Card');
  });

  it('should fetch NOI Decision Condition Cards by file number', async () => {
    const mockResponse = [] as NoticeOfIntentDecisionConditionCardDto[];
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    await service.fetchByNoticeOfIntentFileNumber('fileNumber');
    expect(service.$conditionCards.value).toEqual(mockResponse);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${service['url']}/noi/fileNumber`);
  });

  it('should handle error when fetching NOI Decision Condition Cards by file number', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => new Error('Error')));

    await service.fetchByNoticeOfIntentFileNumber('fileNumber');
    expect(service.$conditionCards.value).toEqual([]);
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith(
      'Failed to fetch NOI Decision Condition Cards by Application File Number',
    );
  });
});
