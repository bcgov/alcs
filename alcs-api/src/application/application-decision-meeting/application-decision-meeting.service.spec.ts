import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDecisionMeetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationDecisionMeetingService],
    }).compile();

    service = module.get<ApplicationDecisionMeetingService>(ApplicationDecisionMeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
