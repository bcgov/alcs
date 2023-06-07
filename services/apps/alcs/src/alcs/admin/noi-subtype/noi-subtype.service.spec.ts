import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentSubtype } from '../../notice-of-intent/notice-of-intent-subtype.entity';
import { NoiSubtypeService } from './noi-subtype.service';

describe('NoiSubtypeService', () => {
  let service: NoiSubtypeService;
  let mockRepository: DeepMocked<Repository<NoticeOfIntentSubtype>>;

  const noticeOfIntentSubtype = new NoticeOfIntentSubtype();

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoiSubtypeService,
        {
          provide: getRepositoryToken(NoticeOfIntentSubtype),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NoiSubtypeService>(NoiSubtypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create ceo criterion entry', async () => {
    mockRepository.save.mockResolvedValue(new NoticeOfIntentSubtype());

    const result = await service.create({
      code: '',
      description: '',
      label: '',
      isActive: true,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should successfully update NOI subtype entry if it exists', async () => {
    mockRepository.save.mockResolvedValue(noticeOfIntentSubtype);
    mockRepository.findOneOrFail.mockResolvedValue(noticeOfIntentSubtype);

    const result = await service.update(noticeOfIntentSubtype.code, {
      code: '',
      description: '',
      label: '',
      isActive: true,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: noticeOfIntentSubtype.code },
    });
    expect(result).toBeDefined();
  });

  it('should successfully fetch NOI subtypes', async () => {
    mockRepository.find.mockResolvedValue([noticeOfIntentSubtype]);

    const result = await service.fetch();

    expect(mockRepository.find).toBeCalledTimes(1);

    expect(mockRepository.find).toBeCalledWith({
      order: {
        label: 'ASC',
      },
    });
    expect(result).toBeDefined();
  });
});
