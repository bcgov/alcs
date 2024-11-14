import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ClsService } from 'nestjs-cls';
import { initTagMockEntity } from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { Tag } from './tag.entity';
import { TagDto } from './tag.dto';
import { UpdateResult } from 'typeorm';

describe('TagController', () => {
  let controller: TagController;
  let tagService: DeepMocked<TagService>;

  const mockTag = initTagMockEntity();

  beforeEach(async () => {
    tagService = createMock<TagService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        { provide: TagService, useValue: tagService },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<TagController>(TagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a tag', async () => {
    tagService.fetch.mockResolvedValue([[mockTag], 1]);

    const result = await controller.fetch(0, 0);
    expect(tagService.fetch).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockTag]);
    expect(result.total).toEqual(1);
  });

  it('should create a tag', async () => {
    const dto: TagDto = {
      uuid: mockTag.uuid,
      name: mockTag.name,
      category: mockTag.category
        ? {
            uuid: mockTag.category?.uuid,
            name: mockTag.name,
          }
        : null,
      isActive: mockTag.isActive,
    };
    tagService.create.mockResolvedValue(mockTag);

    const result = await controller.create(dto);
    expect(tagService.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTag);
  });

  it('should update tag if correct category provided', async () => {
    tagService.update.mockResolvedValue({
      ...mockTag,
    } as Tag);
    const tagToUpdate = {
      uuid: mockTag.uuid,
      name: mockTag.name,
      isActive: mockTag.isActive,
      category: mockTag.category,
    } as TagDto;

    const result = await controller.update(mockTag.uuid, tagToUpdate);

    expect(tagService.update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTag);
  });

  it('should delete a tag', async () => {
    tagService.delete.mockResolvedValue({} as UpdateResult);

    const result = await controller.delete(mockTag.uuid);
    expect(tagService.delete).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });
});
