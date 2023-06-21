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
});
