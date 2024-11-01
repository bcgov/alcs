import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Repository } from 'typeorm';
import { Tag } from '../../tag/tag.entity';
import {
  initNoticeOfIntentMockEntity,
  initNoticeOfIntentWithTagsMockEntity,
  initTagMockEntity,
} from '../../../../test/mocks/mockEntities';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';

describe('NoticeOfIntentTagService', () => {
  let service: NoticeOfIntentTagService;
  let noiRepositoryMock: DeepMocked<Repository<NoticeOfIntent>>;
  let tagRepositoryMock: DeepMocked<Repository<Tag>>;

  let mockNoiEntityWithoutTags: NoticeOfIntent;
  let mockNoiEntityWithTags: NoticeOfIntent;
  let mockNoiEntityWithDifferentTags: NoticeOfIntent;
  let mockTagEntity: Tag;

  beforeEach(async () => {
    tagRepositoryMock = createMock();
    noiRepositoryMock = createMock();
    mockNoiEntityWithoutTags = initNoticeOfIntentMockEntity();
    mockNoiEntityWithTags = initNoticeOfIntentWithTagsMockEntity();
    mockNoiEntityWithDifferentTags = initNoticeOfIntentWithTagsMockEntity();
    mockNoiEntityWithDifferentTags.tags[0].name = 'tag-name-2';
    mockNoiEntityWithDifferentTags.tags[0].uuid = 'tag-uuid-2';
    mockTagEntity = initTagMockEntity();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentTagService,
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: noiRepositoryMock,
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: tagRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentTagService>(NoticeOfIntentTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add tag to the noi if not existing', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithoutTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);
    noiRepositoryMock.save.mockResolvedValue(mockNoiEntityWithTags);

    await service.addTagToNoticeOfIntent('app_1', 'tag-name');
    expect(mockNoiEntityWithoutTags.tags.length).toEqual(1);
    expect(noiRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should raise an error if noi is not found', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.addTagToNoticeOfIntent('noi-1', 'tag-name')).rejects.toThrow(ServiceNotFoundException);
  });

  it('should throw an error if tag is not found', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithoutTags);
    tagRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.addTagToNoticeOfIntent('noi-1', 'tag-name')).rejects.toThrow(ServiceNotFoundException);
  });

  it('should raise an error if the noi already has the tag', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    await expect(service.addTagToNoticeOfIntent('noi-1', 'tag-name')).rejects.toThrow(ServiceValidationException);
  });

  it('should throw an error if the noi does not have any tags when deleting', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithoutTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    await expect(service.removeTagFromNoticeOfIntent('noi-1', 'tag-name')).rejects.toThrow(ServiceValidationException);
  });

  it('should throw an error if the noi does not have the tag requested when deleting', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithDifferentTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    await expect(service.removeTagFromNoticeOfIntent('noi-1', 'tag-name')).rejects.toThrow(ServiceValidationException);
  });

  it('should delete the tag from noi if exists', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);
    noiRepositoryMock.save.mockResolvedValue(mockNoiEntityWithoutTags);

    await service.removeTagFromNoticeOfIntent('noi-1', 'tag-name');
    expect(mockNoiEntityWithTags.tags.length).toEqual(0);
    expect(noiRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should return noi tags', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    const result = await service.getNoticeOfIntentTags('noi-1');
    expect(result).toBeTruthy();
    expect(result.length).toEqual(1);
  });

  it('should return empty array if noi does not have tags', async () => {
    noiRepositoryMock.findOne.mockResolvedValue(mockNoiEntityWithoutTags);

    const result = await service.getNoticeOfIntentTags('noi-1');
    expect(result).toEqual([]);
    expect(result.length).toEqual(0);
  });
});
