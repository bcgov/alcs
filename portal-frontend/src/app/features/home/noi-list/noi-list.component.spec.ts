import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { NoiListComponent } from './noi-list.component';

describe('NoiListComponent', () => {
  let component: NoiListComponent;
  let fixture: ComponentFixture<NoiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoiListComponent],
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
