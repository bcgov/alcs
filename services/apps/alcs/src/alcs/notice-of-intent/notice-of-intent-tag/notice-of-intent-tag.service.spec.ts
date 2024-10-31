import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Repository } from 'typeorm';
import { Tag } from '../../tag/tag.entity';

describe('NoticeOfIntentTagService', () => {
  let service: NoticeOfIntentTagService;
  let noiRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let tagRepository: DeepMocked<Repository<Tag>>;

  beforeEach(async () => {
    noiRepository = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentTagService,
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: noiRepository,
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: tagRepository,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentTagService>(NoticeOfIntentTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
