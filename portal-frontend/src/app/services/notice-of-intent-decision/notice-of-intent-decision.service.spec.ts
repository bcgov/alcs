import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDecisionService } from './notice-of-intent-decision.service';

describe('NoticeOfIntentDecisionService', () => {
  let service: NoticeOfIntentDecisionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

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
      ],
    });
    service = TestBed.inject(NoticeOfIntentDecisionService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
