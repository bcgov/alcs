import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { StaffJournalService } from '../../services/application/application-staff-journal/staff-journal.service';
import { ToastService } from '../../services/toast/toast.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

import { StaffJournalComponent } from './staff-journal.component';

describe('StaffJournalComponent', () => {
  let component: StaffJournalComponent;
  let fixture: ComponentFixture<StaffJournalComponent>;
  let mockApplicationStaffJournalService: DeepMocked<StaffJournalService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockApplicationStaffJournalService = createMock();
    mockConfirmationDialogService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [StaffJournalComponent],
      providers: [
        { provide: StaffJournalService, useValue: mockApplicationStaffJournalService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: ToastService, useValue: mockToastService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
