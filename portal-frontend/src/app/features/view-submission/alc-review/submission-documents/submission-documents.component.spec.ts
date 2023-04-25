import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';

import { SubmissionDocumentsComponent } from './submission-documents.component';

describe('SubmissionDocumentsComponent', () => {
  let component: SubmissionDocumentsComponent;
  let fixture: ComponentFixture<SubmissionDocumentsComponent>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppDocService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubmissionDocumentsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
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
