import { TestBed } from '@angular/core/testing';
import { ApplicationStaffJournalService } from './application-staff-journal.service';

describe('ApplicationStaffJournalService', () => {
  let service: ApplicationStaffJournalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationStaffJournalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
