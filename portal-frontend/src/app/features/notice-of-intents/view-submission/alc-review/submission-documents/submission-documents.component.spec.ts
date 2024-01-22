import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';

import { SubmissionDocumentsComponent } from './submission-documents.component';

describe('SubmissionDocumentsComponent', () => {
  let component: SubmissionDocumentsComponent;
  let fixture: ComponentFixture<SubmissionDocumentsComponent>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    mockNoiDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubmissionDocumentsComponent],
      providers: [
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
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
