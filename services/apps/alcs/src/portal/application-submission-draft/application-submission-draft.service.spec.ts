import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { create } from 'handlebars';
import { Repository } from 'typeorm';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { User } from '../../user/user.entity';
import { ApplicationOwnerService } from '../application-submission/application-owner/application-owner.service';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { CovenantTransferee } from '../application-submission/covenant-transferee/covenant-transferee.entity';
import { CovenantTransfereeService } from '../application-submission/covenant-transferee/covenant-transferee.service';
import { GenerateSubmissionDocumentService } from '../pdf-generation/generate-submission-document.service';
import { ApplicationSubmissionDraftService } from './application-submission-draft.service';

describe('ApplicationSubmissionDraftService', () => {
  let service: ApplicationSubmissionDraftService;
  let mockSubmissionRepo: DeepMocked<Repository<ApplicationSubmission>>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockGenerateSubmissionDocumentService: DeepMocked<GenerateSubmissionDocumentService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockTransfereeService: DeepMocked<CovenantTransfereeService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockSubmissionRepo = createMock();
    mockAppSubmissionService = createMock();
    mockParcelService = createMock();
    mockAppOwnerService = createMock();
    mockGenerateSubmissionDocumentService = createMock();
    mockApplicationSubmissionStatusService = createMock();
    mockTransfereeService = createMock();
    mockApplicationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionDraftService,
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockSubmissionRepo,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: GenerateSubmissionDocumentService,
          useValue: mockGenerateSubmissionDocumentService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
        {
          provide: CovenantTransfereeService,
          useValue: mockTransfereeService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    service = module.get<ApplicationSubmissionDraftService>(
      ApplicationSubmissionDraftService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('return the draft if one exists', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(new ApplicationSubmission());

    const draft = await service.getOrCreateDraft('fileNumber');

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(1);
    expect(draft).toBeDefined();
  });

  it('create a new draft if one does not exist', async () => {
    mockSubmissionRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        new ApplicationSubmission({
          owners: [],
          parcels: [],
        }),
      )
      .mockResolvedValueOnce(new ApplicationSubmission());

    mockSubmissionRepo.save.mockResolvedValue(new ApplicationSubmission());
    mockParcelService.update.mockResolvedValue([]);
    const mockTransaction = jest.fn();
    mockSubmissionRepo.manager.transaction = mockTransaction;
    mockApplicationSubmissionStatusService.getCopiedStatuses.mockResolvedValue(
      [],
    );

    const draft = await service.getOrCreateDraft('fileNumber');

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(3);
    expect(mockSubmissionRepo.save).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.getCopiedStatuses,
    ).toHaveBeenCalledTimes(1);
    expect(draft).toBeDefined();
  });

  it('should delete a draft, attached parcels, statuses, transferees and owners', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(
      new ApplicationSubmission({
        owners: [],
        parcels: [],
      }),
    );

    mockSubmissionRepo.remove.mockResolvedValue(new ApplicationSubmission());
    mockParcelService.deleteMany.mockResolvedValueOnce([]);
    mockApplicationSubmissionStatusService.removeStatuses.mockResolvedValue(
      {} as any,
    );
    mockTransfereeService.fetchBySubmissionUuid.mockResolvedValue([
      new CovenantTransferee(),
    ]);
    mockTransfereeService.delete.mockResolvedValue({} as any);

    await service.deleteDraft('fileNumber');

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockTransfereeService.fetchBySubmissionUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockTransfereeService.delete).toHaveBeenCalledTimes(1);
    expect(mockParcelService.deleteMany).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.removeStatuses,
    ).toHaveBeenCalledTimes(1);
  });

  it('should load two submissions and save one as not draft when publishing', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(
      new ApplicationSubmission({
        uuid: 'fake',
        owners: [],
        parcels: [],
      }),
    );

    mockSubmissionRepo.delete.mockResolvedValue({} as any);
    mockSubmissionRepo.save.mockResolvedValue(new ApplicationSubmission());
    mockParcelService.deleteMany.mockResolvedValueOnce([]);
    mockGenerateSubmissionDocumentService.generateUpdate.mockResolvedValue();
    mockApplicationSubmissionStatusService.removeStatuses.mockResolvedValue(
      {} as any,
    );
    mockTransfereeService.fetchBySubmissionUuid.mockResolvedValue([
      new CovenantTransferee(),
    ]);
    mockTransfereeService.delete.mockResolvedValue({} as any);
    mockApplicationService.updateApplicant.mockResolvedValue();

    await service.publish('fileNumber', new User());

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(2);
    expect(mockSubmissionRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.delete).toBeCalledWith({ uuid: 'fake' });
    expect(mockTransfereeService.fetchBySubmissionUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockTransfereeService.delete).toHaveBeenCalledTimes(1);
    expect(mockParcelService.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.save).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.removeStatuses,
    ).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.save.mock.calls[0][0].isDraft).toEqual(false);
    expect(
      mockGenerateSubmissionDocumentService.generateUpdate,
    ).toHaveBeenCalledTimes(1);
    expect(mockApplicationService.updateApplicant).toHaveBeenCalledTimes(1);
  });

  it('should call through for mapToDto', async () => {
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValueOnce({} as any);

    const res = await service.mapToDetailedDto(new ApplicationSubmission());

    expect(mockAppSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res.canEdit).toBeTruthy();
  });
});
