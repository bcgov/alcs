import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ToastService } from '../toast/toast.service';

import { DocumentService } from '../document/document.service';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(() => {
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    });
    service = TestBed.inject(ApplicationParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
