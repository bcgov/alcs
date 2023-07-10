import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationOwnerProfile } from '../../../common/automapper/application-owner.automapper.profile';
import { ApplicationSubmissionProfile } from '../../../common/automapper/application-submission.automapper.profile';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { SubmissionStatusType } from '../../../portal/application-submission/submission-status/submission-status-type.entity';
import { APPLICATION_STATUS } from '../../../portal/application-submission/submission-status/submission-status.dto';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;
  let mockApplicationStatusRepository: DeepMocked<
    Repository<SubmissionStatusType>
  >;

  beforeEach(async () => {
    mockApplicationSubmissionRepository = createMock();
    mockApplicationStatusRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationSubmissionService,
        ApplicationSubmissionProfile,
        ApplicationOwnerProfile,
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockApplicationSubmissionRepository,
        },
        {
          provide: getRepositoryToken(SubmissionStatusType),
          useValue: mockApplicationStatusRepository,
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
        owners: {
          type: true,
        },
      },
    });
  });

  it('should properly map to dto', async () => {
    const fakeSubmission = createMock<ApplicationSubmission>({
      primaryContactOwnerUuid: 'uuid',
    });
    fakeSubmission.owners = [
      new ApplicationOwner({
        uuid: 'uuid',
      }),
    ];

    const result = await service.mapToDto(fakeSubmission);

    expect(result).toBeDefined();
    expect(result.primaryContact).toBeDefined();
  });

  it('should successfully retrieve status from repo', async () => {
    mockApplicationStatusRepository.findOneOrFail.mockResolvedValue(
      {} as SubmissionStatusType,
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
      {} as SubmissionStatusType,
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
