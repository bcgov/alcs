import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParcelLookup } from './parcel-lookup.entity';
import { ParcelService } from './parcel.service';

describe('ParcelService', () => {
  let service: ParcelService;
  let mockRepo: DeepMocked<Repository<ParcelLookup>>;

  beforeEach(async () => {
    mockRepo = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelService,
        {
          provide: getRepositoryToken(ParcelLookup),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ParcelService>(ParcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through to the repo for get by pid', async () => {
    const mockRes = {} as ParcelLookup;
    mockRepo.findOne.mockResolvedValue(mockRes);

    const res = await service.fetchByPid('pid');
    expect(mockRepo.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockRes);
  });

  it('should call through to the repo for get', async () => {
    const mockRes = {} as ParcelLookup;
    mockRepo.findOne.mockResolvedValue(mockRes);

    const res = await service.fetchByPin('pin');
    expect(mockRepo.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockRes);
  });
});
