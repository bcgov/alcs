import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CodeService } from '../../../../services/code/code.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ChangeNoiTypeDialogComponent } from './change-noi-type-dialog.component';

describe('ChangeNoiTypeDialogComponent', () => {
  let component: ChangeNoiTypeDialogComponent;
  let fixture: ComponentFixture<ChangeNoiTypeDialogComponent>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockCodeService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        { provide: MAT_DIALOG_DATA, useValue: { fileId: 'fake' } },
      ],
      declarations: [ChangeNoiTypeDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeNoiTypeDialogComponent);
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
