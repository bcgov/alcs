import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionDraftService } from '../../../services/application-submission/application-submission-draft.service';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../services/code/code.service';

import { MatDialogModule } from '@angular/material/dialog';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../services/toast/toast.service';
import { AlcsEditSubmissionComponent } from './alcs-edit-submission.component';

describe('AlcsEditSubmissionComponent', () => {
  let component: AlcsEditSubmissionComponent;
  let fixture: ComponentFixture<AlcsEditSubmissionComponent>;
  let mockSubmissionService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockSubmissionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [AlcsEditSubmissionComponent],
      providers: [
        {
          provide: ApplicationSubmissionDraftService,
          useValue: {},
        },
        {
          provide: ApplicationDocumentService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: PdfGenerationService,
          useValue: {},
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockSubmissionService,
        },
      ],
      imports: [RouterTestingModule, MatAutocompleteModule, MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AlcsEditSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
