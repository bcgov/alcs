import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationDecisionComponentController } from './application-decision-component.controller';
import { CreateApplicationDecisionComponentDto } from './application-decision-component.dto';
import { ApplicationDecisionComponent } from './application-decision-component.entity';
import { ApplicationDecisionComponentService } from './application-decision-component.service';

describe('ApplicationDecisionComponentController', () => {
  let controller: ApplicationDecisionComponentController;
  let mockApplicationDecisionComponentService: DeepMocked<ApplicationDecisionComponentService>;

  beforeEach(async () => {
    mockApplicationDecisionComponentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionComponentController],
      providers: [
        ...mockKeyCloakProviders,
        ApplicationDecisionProfile,
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: ApplicationDecisionComponentService,
          useValue: mockApplicationDecisionComponentService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationDecisionComponentController>(
      ApplicationDecisionComponentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call update of ApplicationDecisionComponentService', async () => {
    mockApplicationDecisionComponentService.createOrUpdate.mockResolvedValue([
      new ApplicationDecisionComponent(),
    ]);
    mockApplicationDecisionComponentService.getOneOrFail.mockResolvedValue(
      new ApplicationDecisionComponent(),
    );
    const updates = {
      uuid: 'fake_uuid',
      alrArea: 10,
      applicationDecisionComponentTypeCode: 'fake',
    } as CreateApplicationDecisionComponentDto;

    await controller.update('fake_uuid', updates);

    expect(
      mockApplicationDecisionComponentService.getOneOrFail,
    ).toBeCalledTimes(1);
    expect(mockApplicationDecisionComponentService.getOneOrFail).toBeCalledWith(
      'fake_uuid',
    );
    expect(
      mockApplicationDecisionComponentService.createOrUpdate,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionComponentService.createOrUpdate,
    ).toBeCalledWith([
      {
        uuid: 'fake_uuid',
        alrArea: 10,
        applicationDecisionComponentTypeCode: 'fake',
      },
    ]);
  });
});
