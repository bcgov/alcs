import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationOwnerService } from '../../../../../services/application-owner/application-owner.service';
import { CodeService } from '../../../../../services/code/code.service';

import { ApplicationOwnerDialogComponent } from './application-owner-dialog.component';

describe('ApplicationOwnerDialogComponent', () => {
  let component: ApplicationOwnerDialogComponent;
  let fixture: ComponentFixture<ApplicationOwnerDialogComponent>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppOwnerService = createMock();
    mockCodeService = createMock();
    mockAppDocService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [ApplicationOwnerDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationOwnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
