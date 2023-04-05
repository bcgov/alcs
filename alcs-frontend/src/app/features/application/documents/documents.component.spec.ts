import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { DocumentsComponent } from './documents.component';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockAppDocService = createMock();
    mockAppDetailService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [DocumentsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
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
