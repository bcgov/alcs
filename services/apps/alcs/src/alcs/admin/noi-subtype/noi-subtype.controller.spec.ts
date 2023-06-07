import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentSubtype } from '../../notice-of-intent/notice-of-intent-subtype.entity';
import { NoiSubtypeController } from './noi-subtype.controller';
import { NoiSubtypeService } from './noi-subtype.service';

describe('NoiSubtypeController', () => {
  let controller: NoiSubtypeController;
  let mockNoiSubtypeService: DeepMocked<NoiSubtypeService>;

  beforeEach(async () => {
    mockNoiSubtypeService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoiSubtypeController],
      providers: [
        {
          provide: NoiSubtypeService,
          useValue: mockNoiSubtypeService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<NoiSubtypeController>(NoiSubtypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching noi subtypes', async () => {
    mockNoiSubtypeService.fetch.mockResolvedValue([]);

    const holidays = await controller.fetch();

    expect(holidays).toBeDefined();
    expect(mockNoiSubtypeService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating an noi subtype', async () => {
    mockNoiSubtypeService.update.mockResolvedValue(new NoticeOfIntentSubtype());

    const holiday = await controller.update(
      'fake',
      new NoticeOfIntentSubtype(),
    );

    expect(holiday).toBeDefined();
    expect(mockNoiSubtypeService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating an noi subtype', async () => {
    mockNoiSubtypeService.create.mockResolvedValue(new NoticeOfIntentSubtype());

    const holiday = await controller.create(new NoticeOfIntentSubtype());

    expect(holiday).toBeDefined();
    expect(mockNoiSubtypeService.create).toHaveBeenCalledTimes(1);
  });
});
