import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../services/public/public.service';

import { PublicLfngReviewComponent } from './lfng-review.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../services/document/document.service';

describe('PublicLfngReviewComponent', () => {
  let component: PublicLfngReviewComponent;
  let fixture: ComponentFixture<PublicLfngReviewComponent>;

  let mockPublicService: DeepMocked<PublicService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockPublicService = createMock();
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
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
      declarations: [PublicLfngReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLfngReviewComponent);
    component = fixture.componentInstance;
    component.applicationDocuments = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
