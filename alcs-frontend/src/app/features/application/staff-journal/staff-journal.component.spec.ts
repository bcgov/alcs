import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationStaffJournalService } from '../../../services/application/application-staff-journal/application-staff-journal.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { StaffJournalComponent } from './staff-journal.component';

describe('StaffJournalComponent', () => {
  let component: StaffJournalComponent;
  let fixture: ComponentFixture<StaffJournalComponent>;
  let mockApplicationStaffJournalService: DeepMocked<ApplicationStaffJournalService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockApplicationStaffJournalService = createMock();
    mockConfirmationDialogService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [StaffJournalComponent],
      providers: [
        { provide: ApplicationStaffJournalService, useValue: mockApplicationStaffJournalService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
