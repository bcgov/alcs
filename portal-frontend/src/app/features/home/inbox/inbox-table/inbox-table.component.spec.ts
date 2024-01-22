import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { InboxTableComponent } from './inbox-table.component';

describe('ApplicationListComponent', () => {
  let component: InboxTableComponent;
  let fixture: ComponentFixture<InboxTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InboxTableComponent],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InboxTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
