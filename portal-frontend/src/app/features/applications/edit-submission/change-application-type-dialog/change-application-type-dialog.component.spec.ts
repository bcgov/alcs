import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../services/code/code.service';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog.component';

describe('ChangeApplicationTypeDialogComponent', () => {
  let component: ChangeApplicationTypeDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTypeDialogComponent>;

  beforeEach(async () => {
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
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { fileId: 'fake' } },
      ],
      declarations: [ChangeApplicationTypeDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeApplicationTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
