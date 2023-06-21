import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { APPLICATION_STATUS } from '../../../portal/application-submission/application-status/application-status.dto';
import { ApplicationStatus } from '../../../portal/application-submission/application-status/application-status.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;
  let mockApplicationStatusRepository: DeepMocked<
    Repository<ApplicationStatus>
  >;
  let mapper: DeepMocked<Mapper>;

  beforeEach(async () => {
    mockApplicationSubmissionRepository = createMock();
    mapper = createMock();
    mockApplicationStatusRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionService,
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockApplicationSubmissionRepository,
        },
        {
          provide: getRepositoryToken(ApplicationStatus),
          useValue: mockApplicationStatusRepository,
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
      where: { fileNumber: fakeFileNumber, isDraft: false },
      relations: {
        naruSubtype: true,
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

  it('should successfully retrieve status from repo', async () => {
    mockApplicationStatusRepository.findOneOrFail.mockResolvedValue(
      {} as ApplicationStatus,
    );

    const result = await service.getStatus(APPLICATION_STATUS.ALC_DECISION);

    expect(result).toBeDefined();
    expect(mockApplicationStatusRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationStatusRepository.findOneOrFail).toBeCalledWith({
      where: { code: APPLICATION_STATUS.ALC_DECISION },
    });
  });

  it('should successfully update the status', async () => {
    mockApplicationStatusRepository.findOneOrFail.mockResolvedValue(
      {} as ApplicationStatus,
    );
    mockApplicationSubmissionRepository.findOneOrFail.mockResolvedValue(
      {} as ApplicationSubmission,
    );
    mockApplicationSubmissionRepository.save.mockResolvedValue(
      {} as ApplicationSubmission,
    );

    await service.updateStatus('fake', APPLICATION_STATUS.ALC_DECISION);

    expect(mockApplicationStatusRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationStatusRepository.findOneOrFail).toBeCalledWith({
      where: { code: APPLICATION_STATUS.ALC_DECISION },
    });
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledWith({
      where: {
        fileNumber: 'fake',
      },
    });
  });
});
