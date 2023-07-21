import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewService } from '../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { CodeService } from '../../services/code/code.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PdfGenerationService } from '../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../services/toast/toast.service';
import { EditSubmissionComponent } from './edit-submission.component';

describe('EditSubmissionComponent', () => {
  let component: EditSubmissionComponent;
  let fixture: ComponentFixture<EditSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSubmissionComponent],
      providers: [
        {
          provide: ApplicationSubmissionService,
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
          provide: ApplicationSubmissionReviewService,
          useValue: {},
        },
      ],
      imports: [RouterTestingModule, MatAutocompleteModule, MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
