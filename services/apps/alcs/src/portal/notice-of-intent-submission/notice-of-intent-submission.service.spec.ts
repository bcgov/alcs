import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentType } from '../../alcs/code/application-code/notice-of-intent-type/notice-of-intent-type.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentSubmissionProfile } from '../../common/automapper/notice-of-intent-submission.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

describe('NoticeOfIntentSubmissionService', () => {
  let service: NoticeOfIntentSubmissionService;
  let mockRepository: DeepMocked<Repository<NoticeOfIntentSubmission>>;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockNoiDocService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;

  beforeEach(async () => {
    mockRepository = createMock();
    mockNoiService = createMock();
    mockLGService = createMock();
    mockNoiDocService = createMock();
    mockFileNumberService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentSubmissionService,
        NoticeOfIntentSubmissionProfile,
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockRepository,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoiService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentSubmissionService>(
      NoticeOfIntentSubmissionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched notice of intent', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const app = await service.getOrFailByFileNumber('');
    expect(app).toBe(noiSubmission);
  });

  it('should return the fetched notice of intent when fetching with user', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const app = await service.getIfCreatorByFileNumber('', new User());
    expect(app).toBe(noiSubmission);
  });

  it('should throw an exception if the notice of intent is not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getIfCreatorByFileNumber('file-number', new User());
    await expect(promise).rejects.toMatchObject(
      new Error(
        `Failed to load notice of intent submission with File ID file-number`,
      ),
    );
  });

  it("should throw an error if notice of intent doesn't exist", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getOrFailByFileNumber('');
    await expect(promise).rejects.toMatchObject(
      new Error('Failed to find notice of intent submission'),
    );
  });

  it('save a new noi for create', async () => {
    const fileId = 'file-id';
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue(new NoticeOfIntentSubmission());
    mockFileNumberService.generateNextFileNumber.mockResolvedValue(fileId);
    mockNoiService.create.mockResolvedValue(new NoticeOfIntent());

    const fileNumber = await service.create('type', new User());

    expect(fileNumber).toEqual(fileId);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockNoiService.create).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by user', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
    mockRepository.find.mockResolvedValue([noiSubmission]);

    const res = await service.getByUser(new User());
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(noiSubmission);
  });

  it('should call through for getByFileId', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const res = await service.getByFileNumber('', new User());
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(noiSubmission);
  });

  it('should use notice of intent type service for mapping DTOs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';

    mockNoiService.listTypes.mockResolvedValue([
      new NoticeOfIntentType({
        code: typeCode,
        portalLabel: 'portalLabel',
        htmlDescription: 'htmlDescription',
        label: 'label',
      }),
    ]);

    const noiSubmission = new NoticeOfIntentSubmission({
      applicant,
      typeCode: typeCode,
      auditCreatedAt: new Date(),
    });
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const res = await service.mapToDTOs([noiSubmission]);
    expect(mockNoiService.listTypes).toHaveBeenCalledTimes(1);
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });

  it('should fail on submitToAlcs if error', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
    });

    mockNoiService.submit.mockRejectedValue(new Error());

    await expect(
      service.submitToAlcs(noticeOfIntentSubmission),
    ).rejects.toMatchObject(
      new BaseServiceException(
        `Failed to submit notice of intent: ${fileNumber}`,
      ),
    );
  });

  it('should call out to service on submitToAlcs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const mockNoiSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
    });
    const mockNoticeOfIntent = new NoticeOfIntent({
      dateSubmittedToAlc: new Date(),
    });

    mockNoiService.submit.mockResolvedValue(mockNoticeOfIntent);
    await service.submitToAlcs(mockNoiSubmission);

    expect(mockNoiService.submit).toBeCalledTimes(1);
  });

  it('should update fields if notice of intent exists', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';

    const mockNoiSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      applicant: 'incognito',
      typeCode: 'fake',
      localGovernmentUuid: 'uuid',
    });

    mockRepository.findOne.mockResolvedValue(mockNoiSubmission);
    mockRepository.save.mockResolvedValue(mockNoiSubmission);
    mockNoiService.update.mockResolvedValue(new NoticeOfIntent());

    const result = await service.update(fileNumber, {
      applicant,
      typeCode,
      localGovernmentUuid,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOne).toBeCalledTimes(2);
    expect(result).toEqual(
      new NoticeOfIntentSubmission({
        fileNumber,
        applicant,
        typeCode,
        localGovernmentUuid,
      }),
    );
  });
});
