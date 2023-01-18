import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockRepo: DeepMocked<Repository<ApplicationParcel>>;

  beforeEach(async () => {
    mockRepo = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationParcelService,
        {
          provide: getRepositoryToken(ApplicationParcel),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ApplicationParcelService>(ApplicationParcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
