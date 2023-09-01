import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { SearchResultDto } from './search.dto';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  const mockSearchResults: SearchResultDto[] = [
    {
      fileNumber: '123456',
      type: 'Type A',
      referenceId: 'REF123',
      localGovernmentName: 'Local Gov 1',
    },
    {
      fileNumber: '789012',
      type: 'Type B',
      referenceId: 'REF456',
      applicant: 'John Doe',
      localGovernmentName: 'Local Gov 2',
      boardCode: 'BC123',
      label: {
        code: 'example_code',
        shortLabel: 'Short label',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        label: 'Application Type 1',
        description: 'Application Type 1',
      },
    },
  ];

  const mockAdvancedSearchEntityResult = {
    total: 0,
    data: [],
  };

  const mockAdvancedSearchResult = {
    applications: [],
    totalApplications: 0,
    noticeOfIntents: [],
    totalNoticeOfIntents: 0,
    nonApplications: [],
    totalNonApplications: 0,
  };

  const mockSearchRequestDto = {
    pageSize: 1,
    page: 1,
    sortField: '1',
    sortDirection: 'ASC',
    isIncludeOtherParcels: false,
    applicationFileTypes: [],
  };

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
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch search results by search text', async () => {
    mockHttpClient.get.mockReturnValue(of(mockSearchResults));

    const res = await service.fetch('1');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.length).toEqual(2);
  });

  it('should show an error toast message if search fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.fetch('1');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch advanced search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockAdvancedSearchResult));

    const res = await service.advancedSearchFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.totalApplications).toEqual(0);
    expect(res?.applications).toEqual([]);
    expect(res?.totalNoticeOfIntents).toEqual(0);
    expect(res?.noticeOfIntents).toEqual([]);
    expect(res?.totalNonApplications).toEqual(0);
    expect(res?.nonApplications).toEqual([]);
  });

  it('should show an error toast message if search fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.advancedSearchFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch application advanced search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockAdvancedSearchEntityResult));

    const res = await service.advancedSearchApplicationsFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.total).toEqual(0);
    expect(res?.data).toEqual([]);
  });

  it('should show an error toast message if application advanced search fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.advancedSearchApplicationsFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch NOI advanced search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockAdvancedSearchEntityResult));

    const res = await service.advancedSearchNoticeOfIntentsFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.total).toEqual(0);
    expect(res?.data).toEqual([]);
  });

  it('should show an error toast message if NOI advanced search fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.advancedSearchNoticeOfIntentsFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });


  it('should fetch Non Applications advanced search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockAdvancedSearchEntityResult));

    const res = await service.advancedSearchNonApplicationsFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.total).toEqual(0);
    expect(res?.data).toEqual([]);
  });

  it('should show an error toast message if NOI advanced search fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.advancedSearchNonApplicationsFetch(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
