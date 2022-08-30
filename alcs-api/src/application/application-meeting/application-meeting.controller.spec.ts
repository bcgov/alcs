import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationMeetingController } from './application-meeting.controller';

describe('ApplicationMeetingController', () => {
  let controller: ApplicationMeetingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationMeetingController],
    }).compile();

    controller = module.get<ApplicationMeetingController>(ApplicationMeetingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
