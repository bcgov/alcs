import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../services/toast/toast.service';

import { EditSubmissionComponent } from './edit-submission.component';

describe('EditSubmissionComponent', () => {
  let component: EditSubmissionComponent;
  let fixture: ComponentFixture<EditSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSubmissionComponent],
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
