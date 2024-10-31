import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentTagController } from './notice-of-intent-tag.controller';
import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import {
  initNoticeOfIntentMockEntity,
  initNoticeOfIntentWithTagsMockEntity,
  initTagMockEntity,
} from '../../../../test/mocks/mockEntities';
import { NoticeOfIntentTagDto } from './notice-of-intent-tag.dto';

describe('NoticeOfIntentTagController', () => {
  let controller: NoticeOfIntentTagController;
  let noiTagService: DeepMocked<NoticeOfIntentTagService>;

  const mockNoticeOfIntentEntityWithoutTags = initNoticeOfIntentMockEntity();
  mockNoticeOfIntentEntityWithoutTags.tags = [];
  const mockNoticeOfIntentEntityWithTags = initNoticeOfIntentWithTagsMockEntity();
  const mockTagEntity = initTagMockEntity();

  beforeEach(async () => {
    noiTagService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentTagController],
      providers: [
        { provide: NoticeOfIntentTagService, useValue: noiTagService },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentTagController>(NoticeOfIntentTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return tags for the application', async () => {
    noiTagService.getNoticeOfIntentTags.mockResolvedValue([mockTagEntity]);

    const result = await controller.getApplicationTags('noi_1');
    expect(noiTagService.getNoticeOfIntentTags).toHaveBeenCalledTimes(1);
    expect(result[0].name).toEqual('tag-name');
  });

  it('should create tags', async () => {
    noiTagService.addTagToNoticeOfIntent.mockResolvedValue(mockNoticeOfIntentEntityWithTags);

    const mockTagDto = new NoticeOfIntentTagDto();
    mockTagDto.tagName = 'tag-name';

    const result = await controller.addTagToApplication('noi_1', mockTagDto);
    expect(noiTagService.addTagToNoticeOfIntent).toHaveBeenCalledTimes(1);
    expect(result.tags[0].name).toEqual('tag-name');
  });

  it('should remove tags', async () => {
    noiTagService.removeTagFromNoticeOfIntent.mockResolvedValue(mockNoticeOfIntentEntityWithoutTags);

    const result = await controller.removeTagFromApplication('noi_1', 'tag-name');
    expect(noiTagService.removeTagFromNoticeOfIntent).toHaveBeenCalledTimes(1);
    expect(result.tags.length).toEqual(0);
  });
});
