import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../alcs/application/application.entity';
import { Covenant } from '../alcs/covenant/covenant.entity';
import { NoticeOfIntent } from '../alcs/notice-of-intent/notice-of-intent.entity';
import { FileNumberService } from './file-number.service';

describe('FileNumberService', () => {
  let service: FileNumberService;
  let mockAppRepo: DeepMocked<Repository<Application>>;
  let mockCovenantRepo: DeepMocked<Repository<Covenant>>;
  let mockNOIRepo: DeepMocked<Repository<NoticeOfIntent>>;

  beforeEach(async () => {
    mockAppRepo = createMock();
    mockCovenantRepo = createMock();
    mockNOIRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileNumberService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockAppRepo,
        },
        {
          provide: getRepositoryToken(Covenant),
          useValue: mockCovenantRepo,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNOIRepo,
        },
      ],
    }).compile();

    service = module.get<FileNumberService>(FileNumberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check all three repos for existence', async () => {
    mockAppRepo.exist.mockResolvedValue(false);
    mockCovenantRepo.exist.mockResolvedValue(false);
    mockNOIRepo.exist.mockResolvedValue(false);

    const res = await service.checkValidFileNumber('');

    expect(res).toEqual(true);
  });

  it('should throw an exception if application exists', async () => {
    mockAppRepo.exist.mockResolvedValue(true);
    mockCovenantRepo.exist.mockResolvedValue(false);
    mockNOIRepo.exist.mockResolvedValue(false);

    const promise = service.checkValidFileNumber('5');
    await expect(promise).rejects.toMatchObject(
      new ServiceValidationException(
        `Application/Covenant/NOI already exists with File ID 5`,
      ),
    );

    expect(mockAppRepo.exist).toHaveBeenCalledTimes(1);
    expect(mockCovenantRepo.exist).toHaveBeenCalledTimes(1);
    expect(mockNOIRepo.exist).toHaveBeenCalledTimes(1);
  });

  it('should generate and return new fileNumber', async () => {
    mockAppRepo.findOne
      .mockResolvedValueOnce({} as Application)
      .mockResolvedValue(null);
    mockAppRepo.query.mockResolvedValue([{ nextval: '2512' }]);

    const result = await service.generateNextFileNumber();

    expect(mockAppRepo.query).toBeCalledTimes(1);
    expect(result).toEqual('2512');
  });
});
