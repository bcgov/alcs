import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDocumentService } from '../../../services/inquiry/inquiry-document/inquiry-document.service';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { DocumentsComponent } from './documents.component';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  let mockInquiryDocumentService: DeepMocked<InquiryDocumentService>;
  let mockInquiryDetailService: DeepMocked<InquiryDetailService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockInquiryDocumentService = createMock();
    mockInquiryDetailService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockInquiryDetailService.$inquiry = new BehaviorSubject<InquiryDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [DocumentsComponent],
      providers: [
        {
          provide: InquiryDocumentService,
          useValue: mockInquiryDocumentService,
        },
        {
          provide: InquiryDetailService,
          useValue: mockInquiryDetailService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
