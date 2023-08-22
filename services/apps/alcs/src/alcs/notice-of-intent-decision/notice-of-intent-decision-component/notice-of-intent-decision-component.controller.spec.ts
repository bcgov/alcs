import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDecisionProfile } from '../../../common/automapper/notice-of-intent-decision.automapper.profile';
import { NoticeOfIntentDecisionComponentController } from './notice-of-intent-decision-component.controller';
import { CreateNoticeOfIntentDecisionComponentDto } from './notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionComponent } from './notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionComponentService } from './notice-of-intent-decision-component.service';

describe('NoticeOfIntentDecisionComponentController', () => {
  let controller: NoticeOfIntentDecisionComponentController;
  let mockApplicationDecisionComponentService: DeepMocked<NoticeOfIntentDecisionComponentService>;

  beforeEach(async () => {
    mockApplicationDecisionComponentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDecisionComponentController],
      providers: [
        ...mockKeyCloakProviders,
        NoticeOfIntentDecisionProfile,
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentDecisionComponentService,
          useValue: mockApplicationDecisionComponentService,
        },
      ],
    }).compile();

    controller = module.get<NoticeOfIntentDecisionComponentController>(
      NoticeOfIntentDecisionComponentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call update of ApplicationDecisionComponentService', async () => {
    mockApplicationDecisionComponentService.createOrUpdate.mockResolvedValue([
      new NoticeOfIntentDecisionComponent(),
    ]);
    mockApplicationDecisionComponentService.getOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionComponent(),
    );
    const updates = {
      uuid: 'fake_uuid',
      alrArea: 10,
      noticeOfIntentDecisionComponentTypeCode: 'fake',
    } as CreateNoticeOfIntentDecisionComponentDto;

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
        noticeOfIntentDecisionComponentTypeCode: 'fake',
      },
    ]);
  });
});
