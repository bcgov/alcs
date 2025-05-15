import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NotificationDocumentService } from '../../../../../services/notification-document/notification-document.service';

import { SubmissionDocumentsComponent } from './submission-documents.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../../services/document/document.service';

describe('SubmissionDocumentsComponent', () => {
  let component: SubmissionDocumentsComponent;
  let fixture: ComponentFixture<SubmissionDocumentsComponent>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockNotificationDocumentService = createMock();
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubmissionDocumentsComponent],
      providers: [
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
