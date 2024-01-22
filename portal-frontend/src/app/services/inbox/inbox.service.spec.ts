import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { InboxService } from './inbox.service';

describe('InboxService', () => {
  let service: InboxService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  const mockSearchEntityResult = {
    total: 0,
    data: [],
  };

  const mockSearchResult = {
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
    fileTypes: [],
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
    service = TestBed.inject(InboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockSearchResult));

    const res = await service.search(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.totalApplications).toEqual(0);
    expect(res?.applications).toEqual([]);
    expect(res?.totalNoticeOfIntents).toEqual(0);
    expect(res?.noticeOfIntents).toEqual([]);
  });

  it('should show an error toast message if search fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.search(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch application advanced search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockSearchEntityResult));

    const res = await service.searchApplications(mockSearchRequestDto);

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

    const res = await service.searchApplications(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch NOI advanced search results by AdvancedSearchRequestDto', async () => {
    mockHttpClient.post.mockReturnValue(of(mockSearchEntityResult));

    const res = await service.searchNoticeOfIntents(mockSearchRequestDto);

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

    const res = await service.searchNoticeOfIntents(mockSearchRequestDto);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
