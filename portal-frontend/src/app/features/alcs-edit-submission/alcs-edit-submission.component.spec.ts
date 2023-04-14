import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { CodeService } from '../../services/code/code.service';

import { MatDialogModule } from '@angular/material/dialog';
import { ApplicationSubmissionDocumentGenerationService } from '../../services/application-submission/application-submisison-document-generation/application-submission-document-generation.service';
import { ToastService } from '../../services/toast/toast.service';
import { AlcsEditSubmissionComponent } from './alcs-edit-submission.component';

describe('AlcsEditSubmissionComponent', () => {
  let component: AlcsEditSubmissionComponent;
  let fixture: ComponentFixture<AlcsEditSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlcsEditSubmissionComponent],
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
          provide: ApplicationSubmissionDocumentGenerationService,
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
