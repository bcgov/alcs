import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { CodeService } from '../../services/code/code.service';
import { NoticeOfIntentSubmissionService } from '../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { NotificationSubmissionService } from '../../services/notification-submission/notification-submission.service';
import { CreateSubmissionDialogComponent } from './create-submission-dialog.component';

describe('CreateSubmissionDialogComponent', () => {
  let component: CreateSubmissionDialogComponent;
  let fixture: ComponentFixture<CreateSubmissionDialogComponent>;

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
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: {},
        },
        {
          provide: NotificationSubmissionService,
          useValue: {},
        },
      ],
      declarations: [CreateSubmissionDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSubmissionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
