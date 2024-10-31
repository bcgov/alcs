import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationTagService } from './application-tag.service';
import { TagModule } from '../../tag/tag.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Repository } from 'typeorm';
import { Tag } from '../../tag/tag.entity';
import { Application } from '../application.entity';
import {
  initApplicationMockEntity,
  initApplicationWithTagsMockEntity,
  initTagMockEntity,
} from '../../../../test/mocks/mockEntities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';

describe('ApplicationTagService', () => {
  let service: ApplicationTagService;
  let tagRepositoryMock: DeepMocked<Repository<Tag>>;
  let applicationRepositoryMock: DeepMocked<Repository<Application>>;

  let mockApplicationEntityWithoutTags: Application;
  let mockApplicationEntityWithTags: Application;
  let mockApplicationEntityWithDifferentTags: Application;
  let mockTagEntity: Tag;

  beforeEach(async () => {
    tagRepositoryMock = createMock();
    applicationRepositoryMock = createMock();

    mockApplicationEntityWithoutTags = initApplicationMockEntity();
    mockApplicationEntityWithTags = initApplicationWithTagsMockEntity();
    mockApplicationEntityWithDifferentTags = initApplicationWithTagsMockEntity();
    mockApplicationEntityWithDifferentTags.tags[0].name = 'tag-name-2';
    mockApplicationEntityWithDifferentTags.tags[0].uuid = 'tag-uuid-2';
    mockTagEntity = initTagMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTagService,
        { provide: getRepositoryToken(Application), useValue: applicationRepositoryMock },
        { provide: getRepositoryToken(Tag), useValue: tagRepositoryMock },
      ],
    }).compile();

    service = module.get<ApplicationTagService>(ApplicationTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add tag to the application if not existing', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithoutTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);
    applicationRepositoryMock.save.mockResolvedValue(mockApplicationEntityWithTags);

    await service.addTagToApplication('app_1', 'tag-name');
    expect(mockApplicationEntityWithoutTags.tags.length).toEqual(1);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should raise an error if application is not found', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.addTagToApplication('app-1', 'tag-name')).rejects.toThrow(ServiceNotFoundException);
  });

  it('should throw an error if tag is not found', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithoutTags);
    tagRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.addTagToApplication('app-1', 'tag-name')).rejects.toThrow(ServiceNotFoundException);
  });

  it('should raise an error if the application already has the tag', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    await expect(service.addTagToApplication('app-1', 'tag-name')).rejects.toThrow(ServiceValidationException);
  });

  it('should throw an error if the application does not have any tags when deleting', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithoutTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    await expect(service.removeTagFromApplication('app-1', 'tag-name')).rejects.toThrow(ServiceValidationException);
  });

  it('should throw an error if the application does not have the tag requested when deleting', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithDifferentTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    await expect(service.removeTagFromApplication('app-1', 'tag-name')).rejects.toThrow(ServiceValidationException);
  });

  it('should delete the tag from application if exists', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);
    applicationRepositoryMock.save.mockResolvedValue(mockApplicationEntityWithoutTags);

    await service.removeTagFromApplication('app-1', 'tag-name');
    expect(mockApplicationEntityWithTags.tags.length).toEqual(0);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should return application tags', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithTags);
    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);

    const result = await service.getApplicationTags('app-1');
    expect(result).toBeTruthy();
    expect(result.length).toEqual(1);
  });

  it('should return empty array if application does not have tags', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(mockApplicationEntityWithoutTags);

    const result = await service.getApplicationTags('app-1');
    expect(result).toEqual([]);
    expect(result.length).toEqual(0);
  });
});
