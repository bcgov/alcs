import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CodeService } from '../../../services/code/code.service';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDraftService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission-draft.service';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../services/toast/toast.service';
import { AlcsEditSubmissionComponent } from './alcs-edit-submission.component';

describe('AlcsEditSubmissionComponent', () => {
  let component: AlcsEditSubmissionComponent;
  let fixture: ComponentFixture<AlcsEditSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlcsEditSubmissionComponent],
      providers: [
        {
          provide: NoticeOfIntentSubmissionDraftService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentDocumentService,
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
