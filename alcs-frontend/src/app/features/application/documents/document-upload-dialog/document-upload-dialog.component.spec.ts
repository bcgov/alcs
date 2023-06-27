import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../services/application/application-parcel/application-parcel.service';

import { DocumentUploadDialogComponent } from './document-upload-dialog.component';

describe('DocumentUploadDialogComponent', () => {
  let component: DocumentUploadDialogComponent;
  let fixture: ComponentFixture<DocumentUploadDialogComponent>;

  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockAppDocService = createMock();
    mockParcelService = createMock();

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
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
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
