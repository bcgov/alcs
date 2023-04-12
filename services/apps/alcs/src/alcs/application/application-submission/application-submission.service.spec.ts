import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;
  let mapper: DeepMocked<Mapper>;

  beforeEach(async () => {
    mockApplicationSubmissionRepository = createMock();
    mapper = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionService,
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockApplicationSubmissionRepository,
        },
        {
          provide: getMapperToken(),
          useValue: mapper,
        },
      ],
    }).compile();

    service = module.get<ApplicationSubmissionService>(
      ApplicationSubmissionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully find ApplicationSubmission', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionRepository.findOneOrFail.mockResolvedValue(
      {} as ApplicationSubmission,
    );

    const result = await service.get(fakeFileNumber);

    expect(result).toBeDefined();
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledWith({
      where: { fileNumber: fakeFileNumber },
      relations: {
        application: {
          documents: {
            document: true,
          },
        },
        parcels: {
          owners: {
            type: true,
          },
          certificateOfTitle: {
            document: true,
          },
          ownershipType: true,
        },
        owners: {
          type: true,
        },
      },
    });
  });

  it('should properly map to dto', async () => {
    mapper.mapAsync.mockResolvedValue({} as any);

    const fakeSubmission = createMock<ApplicationSubmission>();
    fakeSubmission.owners = [new ApplicationOwner()];

    const result = await service.mapToDto(fakeSubmission);

    expect(mapper.mapAsync).toBeCalledTimes(2);
    expect(result).toBeDefined();
  });
});
