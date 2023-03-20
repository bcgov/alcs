import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { ApplicationListComponent } from './application-list.component';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationListComponent],
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

    fixture = TestBed.createComponent(ApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
