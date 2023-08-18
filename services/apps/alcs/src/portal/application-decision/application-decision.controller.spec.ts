import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { ApplicationDecisionV2Service } from '../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecisionProfile } from '../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { User } from '../../user/user.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationDecisionController } from './application-decision.controller';

describe('ApplicationDecisionController', () => {
  let controller: ApplicationDecisionController;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockDecisionService: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockApplicationSubmissionService = createMock();
    mockDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionController],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationDecisionController>(
      ApplicationDecisionController,
    );

    mockApplicationSubmissionService.verifyAccessByFileId.mockResolvedValue(
      new ApplicationSubmission(),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should verify access and call through for loading decisions', async () => {
    mockDecisionService.getForPortal.mockResolvedValue([
      new ApplicationDecision(),
    ]);

    const res = await controller.listDecisions('', {
      user: {
        entity: new User(),
      },
    });

    expect(res.length).toEqual(1);
    expect(
      mockApplicationSubmissionService.verifyAccessByFileId,
    ).toHaveBeenCalledTimes(1);
    expect(mockDecisionService.getForPortal).toHaveBeenCalledTimes(1);
  });

  it('should call through for loading files', async () => {
    mockDecisionService.getDownloadUrl.mockResolvedValue('Mock Url');

    const res = await controller.openFile('', {
      user: {
        entity: new User(),
      },
    });

    expect(res.url).toBeTruthy();
    expect(mockDecisionService.getDownloadUrl).toHaveBeenCalledTimes(1);
  });
});
