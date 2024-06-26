import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelService } from '../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import { GenerateNoiSubmissionDocumentService } from '../pdf-generation/generate-noi-submission-document.service';
import { NoticeOfIntentSubmissionDraftService } from './notice-of-intent-submission-draft.service';

describe('NoticeOfIntentSubmissionDraftService', () => {
  let service: NoticeOfIntentSubmissionDraftService;
  let mockSubmissionRepo: DeepMocked<Repository<NoticeOfIntentSubmission>>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockAppOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
  let mockGenerateSubmissionDocumentService: DeepMocked<GenerateNoiSubmissionDocumentService>;
  let mockNoiSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;

  let mockUser;

  beforeEach(async () => {
    mockSubmissionRepo = createMock();
    mockNoiSubmissionService = createMock();
    mockParcelService = createMock();
    mockAppOwnerService = createMock();
    mockGenerateSubmissionDocumentService = createMock();
    mockNoiSubmissionStatusService = createMock();
    mockNoiService = createMock();
    mockLocalGovernmentService = createMock();
    mockStatusEmailService = createMock();

    mockUser = new User({
      clientRoles: [],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentSubmissionDraftService,
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockSubmissionRepo,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockParcelService,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: GenerateNoiSubmissionDocumentService,
          useValue: mockGenerateSubmissionDocumentService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoiSubmissionStatusService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoiService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentSubmissionDraftService>(
      NoticeOfIntentSubmissionDraftService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('return the draft if one exists', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );

    const draft = await service.getOrCreateDraft('fileNumber', mockUser);

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(1);
    expect(draft).toBeDefined();
  });

  it('create a new draft if one does not exist', async () => {
    mockSubmissionRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        new NoticeOfIntentSubmission({
          owners: [],
          parcels: [],
        }),
      )
      .mockResolvedValueOnce(new NoticeOfIntentSubmission());

    mockSubmissionRepo.save.mockResolvedValue(new NoticeOfIntentSubmission());
    mockParcelService.update.mockResolvedValue([]);
    const mockTransaction = jest.fn();
    mockSubmissionRepo.manager.transaction = mockTransaction;
    mockNoiSubmissionStatusService.getCopiedStatuses.mockResolvedValue([]);

    const draft = await service.getOrCreateDraft('fileNumber', mockUser);

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(3);
    expect(mockSubmissionRepo.save).toHaveBeenCalledTimes(1);
    expect(
      mockNoiSubmissionStatusService.getCopiedStatuses,
    ).toHaveBeenCalledTimes(1);
    expect(draft).toBeDefined();
  });

  it('should delete a draft, attached parcels, statuses and owners', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(
      new NoticeOfIntentSubmission({
        owners: [],
        parcels: [],
      }),
    );

    mockSubmissionRepo.remove.mockResolvedValue(new NoticeOfIntentSubmission());
    mockParcelService.deleteMany.mockResolvedValueOnce([]);
    mockNoiSubmissionStatusService.removeStatuses.mockResolvedValue({} as any);

    await service.deleteDraft('fileNumber', mockUser);

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockParcelService.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionStatusService.removeStatuses).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should load two submissions and save one as not draft when publishing and not send local government email', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(
      new NoticeOfIntentSubmission({
        uuid: 'fake',
        owners: [],
        parcels: [],
      }),
    );

    mockSubmissionRepo.delete.mockResolvedValue({} as any);
    mockSubmissionRepo.save.mockResolvedValue(new NoticeOfIntentSubmission());
    mockParcelService.deleteMany.mockResolvedValueOnce([]);
    mockGenerateSubmissionDocumentService.generateUpdate.mockResolvedValue();
    mockNoiSubmissionStatusService.removeStatuses.mockResolvedValue({} as any);
    mockNoiService.updateNoticeOfIntentInfo.mockResolvedValue();

    await service.publish('fileNumber', new User());

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(2);
    expect(mockSubmissionRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.delete).toHaveBeenCalledWith({ uuid: 'fake' });
    expect(mockParcelService.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.save).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionStatusService.removeStatuses).toHaveBeenCalledTimes(
      1,
    );
    expect(mockSubmissionRepo.save.mock.calls[0][0].isDraft).toEqual(false);
    expect(
      mockGenerateSubmissionDocumentService.generateUpdate,
    ).toHaveBeenCalledTimes(1);
    expect(mockNoiService.updateNoticeOfIntentInfo).toHaveBeenCalledTimes(1);
  });

  it('should call through for mapToDto', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValueOnce({} as any);

    const res = await service.mapToDetailedDto(
      new NoticeOfIntentSubmission(),
      new User({
        clientRoles: [],
      }),
    );

    expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res.canEdit).toBeTruthy();
  });

  it('should update submission to not draft and send new local government email', async () => {
    const newNoi = new NoticeOfIntentSubmission({
      uuid: 'fake',
      owners: [],
      parcels: [],
      localGovernmentUuid: 'new',
    });

    mockSubmissionRepo.findOne.mockResolvedValueOnce(
      new NoticeOfIntentSubmission({
        uuid: 'fake',
        owners: [],
        parcels: [],
        localGovernmentUuid: 'old',
      }),
    );

    mockSubmissionRepo.findOne.mockResolvedValue(newNoi);

    mockSubmissionRepo.delete.mockResolvedValue({} as any);
    mockSubmissionRepo.save.mockResolvedValue(newNoi);
    mockParcelService.deleteMany.mockResolvedValueOnce([]);
    mockGenerateSubmissionDocumentService.generateUpdate.mockResolvedValue();
    mockNoiSubmissionStatusService.removeStatuses.mockResolvedValue({} as any);
    mockNoiService.updateNoticeOfIntentInfo.mockResolvedValue();
    mockLocalGovernmentService.getByUuid.mockResolvedValue(
      new LocalGovernment({ uuid: 'new' }),
    );
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await service.publish('fileNumber', new User());

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(2);
    expect(mockSubmissionRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.delete).toHaveBeenCalledWith({ uuid: 'fake' });
    expect(mockParcelService.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.save).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionStatusService.removeStatuses).toHaveBeenCalledTimes(
      1,
    );
    expect(mockSubmissionRepo.save.mock.calls[0][0].isDraft).toEqual(false);
    expect(
      mockGenerateSubmissionDocumentService.generateUpdate,
    ).toHaveBeenCalledTimes(1);
    expect(mockNoiService.updateNoticeOfIntentInfo).toHaveBeenCalledTimes(1);
    expect(mockLocalGovernmentService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockLocalGovernmentService.getByUuid).toHaveBeenCalledWith('new');
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toHaveBeenCalledTimes(1);
  });
});
