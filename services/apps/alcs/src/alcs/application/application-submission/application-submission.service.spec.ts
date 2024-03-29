import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CovenantTransferee } from '../../../portal/application-submission/covenant-transferee/covenant-transferee.entity';
import { ApplicationSubmissionStatusService } from '../application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../application-submission-status/submission-status.dto';
import { ApplicationOwnerProfile } from '../../../common/automapper/application-owner.automapper.profile';
import { ApplicationSubmissionProfile } from '../../../common/automapper/application-submission.automapper.profile';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;
  let mockApplicationStatusRepository: DeepMocked<
    Repository<ApplicationSubmissionStatusType>
  >;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockCovenantTransfereeRepo: DeepMocked<Repository<CovenantTransferee>>;

  beforeEach(async () => {
    mockApplicationSubmissionRepository = createMock();
    mockApplicationStatusRepository = createMock();
    mockApplicationSubmissionStatusService = createMock();
    mockCovenantTransfereeRepo = createMock();

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
          provide: getRepositoryToken(ApplicationSubmissionStatusType),
          useValue: mockApplicationStatusRepository,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
        {
          provide: getRepositoryToken(CovenantTransferee),
          useValue: mockCovenantTransfereeRepo,
        },
      ],
    }).compile();

    mockApplicationSubmissionStatusService.setStatusDate.mockResolvedValue(
      {} as any,
    );

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
      {} as ApplicationSubmissionStatusType,
    );

    const result = await service.getStatus(SUBMISSION_STATUS.ALC_DECISION);

    expect(result).toBeDefined();
    expect(mockApplicationStatusRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationStatusRepository.findOneOrFail).toBeCalledWith({
      where: { code: SUBMISSION_STATUS.ALC_DECISION },
    });
  });

  it('should successfully update the status', async () => {
    mockApplicationStatusRepository.findOneOrFail.mockResolvedValue(
      {} as ApplicationSubmissionStatusType,
    );
    mockApplicationSubmissionRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
    } as ApplicationSubmission);

    await service.updateStatus('fake', SUBMISSION_STATUS.ALC_DECISION);

    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledWith({
      where: {
        fileNumber: 'fake',
      },
    });
    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledWith(
      'fake',
      SUBMISSION_STATUS.ALC_DECISION,
    );
  });

  it('should call repo for retrieving transferees', async () => {
    mockCovenantTransfereeRepo.find.mockResolvedValue([]);

    const result = await service.getTransferees('file-number');

    expect(result).toBeDefined();
    expect(mockCovenantTransfereeRepo.find).toBeCalledTimes(1);
  });
});
