import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoiDocumentService } from '../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NotificationDocumentService } from '../../../../services/notification/notification-document/notification-document.service';

import { DocumentUploadDialogComponent } from './document-upload-dialog.component';

describe('DocumentUploadDialogComponent', () => {
  let component: DocumentUploadDialogComponent;
  let fixture: ComponentFixture<DocumentUploadDialogComponent>;

  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;

  beforeEach(async () => {
    mockNotificationDocumentService = createMock();

    const mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
      subscribe: jest.fn(),
      backdropClick: () => new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      declarations: [DocumentUploadDialogComponent],
      providers: [
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      imports: [MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
