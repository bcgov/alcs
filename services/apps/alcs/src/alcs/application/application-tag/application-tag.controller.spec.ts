import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationTagController } from './application-tag.controller';
import { ApplicationTagService } from './application-tag.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import {
  initApplicationMockEntity,
  initApplicationWithTagsMockEntity,
  initTagMockEntity,
} from '../../../../test/mocks/mockEntities';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { TagModule } from '../../tag/tag.module';
import { ApplicationTagDto } from './application-tag.dto';

describe('ApplicationTagController', () => {
  let controller: ApplicationTagController;
  let applicationTagService: DeepMocked<ApplicationTagService>;

  const mockApplicationEntityWithoutTags = initApplicationMockEntity();
  mockApplicationEntityWithoutTags.tags = [];
  const mockApplicationEntityWithTags = initApplicationWithTagsMockEntity();
  const mockTagEntity = initTagMockEntity();

  beforeEach(async () => {
    applicationTagService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationTagController],
      providers: [
        { provide: ApplicationTagService, useValue: applicationTagService },
        { provide: ClsService, useValue: {} },
        ...mockKeyCloakProviders,
      ],
      imports: [],
    }).compile();

    controller = module.get<ApplicationTagController>(ApplicationTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return tags for the application', async () => {
    applicationTagService.getApplicationTags.mockResolvedValue([mockTagEntity]);

    const result = await controller.getApplicationTags('app_1');
    expect(applicationTagService.getApplicationTags).toHaveBeenCalledTimes(1);
    expect(result[0].name).toEqual('tag-name');
  });

  it('should create tags', async () => {
    applicationTagService.addTagToApplication.mockResolvedValue(mockApplicationEntityWithTags);

    const mockTagDto = new ApplicationTagDto();
    mockTagDto.tagName = 'tag-name';

    const result = await controller.addTagToApplication('app_1', mockTagDto);
    expect(applicationTagService.addTagToApplication).toHaveBeenCalledTimes(1);
    expect(result.tags[0].name).toEqual('tag-name');
  });

  it('should remove tags', async () => {
    applicationTagService.removeTagFromApplication.mockResolvedValue(mockApplicationEntityWithoutTags);

    const result = await controller.removeTagFromApplication('app_1', 'tag-name');
    expect(applicationTagService.removeTagFromApplication).toHaveBeenCalledTimes(1);
    expect(result.tags.length).toEqual(0);
  });
});
