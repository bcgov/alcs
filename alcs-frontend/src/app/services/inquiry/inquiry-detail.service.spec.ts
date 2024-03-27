import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom } from 'rxjs';
import { InquiryDetailService } from './inquiry-detail.service';
import { InquiryDto } from './inquiry.dto';
import { InquiryService } from './inquiry.service';

describe('InquiryDetailService', () => {
  let service: InquiryDetailService;
  let mockInquiryService: DeepMocked<InquiryService>;

  beforeEach(() => {
    mockInquiryService = createMock();

    TestBed.configureTestingModule({
      providers: [
        InquiryDetailService,
        {
          provide: InquiryService,
          useValue: mockInquiryService,
        },
      ],
    });
    service = TestBed.inject(InquiryDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish the loaded application', async () => {
    mockInquiryService.fetch.mockResolvedValue({
      fileNumber: '1',
    } as InquiryDto);

    await service.loadInquiry('1');
    const res = await firstValueFrom(service.$inquiry);

    expect(mockInquiryService.fetch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should publish the updated application for update', async () => {
    mockInquiryService.update.mockResolvedValue({
      fileNumber: '1',
    } as InquiryDto);

    await service.update('1', {});
    const res = await firstValueFrom(service.$inquiry);

    expect(mockInquiryService.update).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });
});
