import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationStaffJournalService } from './application-staff-journal.service';

describe('ApplicationStaffJournalService', () => {
  let service: ApplicationStaffJournalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationStaffJournalService],
    }).compile();

    service = module.get<ApplicationStaffJournalService>(ApplicationStaffJournalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
