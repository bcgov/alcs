import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationStaffJournalController } from './application-staff-journal.controller';

describe('ApplicationStaffJournalController', () => {
  let controller: ApplicationStaffJournalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationStaffJournalController],
    }).compile();

    controller = module.get<ApplicationStaffJournalController>(ApplicationStaffJournalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
