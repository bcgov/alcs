import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../services/code/code.service';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog.component';

describe('ChangeApplicationTypeDialogComponent', () => {
  let component: ChangeApplicationTypeDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTypeDialogComponent>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockCodeService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationSubmissionService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        { provide: MAT_DIALOG_DATA, useValue: { fileId: 'fake' } },
      ],
      declarations: [ChangeApplicationTypeDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeApplicationTypeDialogComponent);
    component = fixture.componentInstance;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
