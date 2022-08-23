import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionMeetingController } from './application-decision-meeting.controller';

describe('ApplicationDecisionMeetingController', () => {
  let controller: ApplicationDecisionMeetingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionMeetingController],
    }).compile();

    controller = module.get<ApplicationDecisionMeetingController>(
      ApplicationDecisionMeetingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
