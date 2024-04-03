import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE } from '../../shared/dto/document.dto';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';

import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockOverlayService: DeepMocked<OverlaySpinnerService>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();
    mockOverlayService = createMock();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: OverlaySpinnerService,
          useValue: mockOverlayService,
        },
      ],
    });
    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for getUploadUrl', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getUploadUrl('fileNumber', null);
    expect(service).toBeTruthy();
  });

  it('should show a warning toast if the file is too large', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.uploadFile(
      'id',
      {
        size: environment.maxFileSize + 5,
      } as File,
      null,
      DOCUMENT_SOURCE.APPLICANT,
      ''
    );

    expect(mockToastService.showWarningToast).toHaveBeenCalledTimes(1);
  });
});
