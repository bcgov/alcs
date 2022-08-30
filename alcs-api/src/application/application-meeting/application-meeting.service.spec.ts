import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationMeetingService } from './application-meeting.service';

describe('ApplicationMeetingService', () => {
  let service: ApplicationMeetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationMeetingService],
    }).compile();

    service = module.get<ApplicationMeetingService>(ApplicationMeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
