import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationOwnerService } from '../application-submission/application-owner/application-owner.service';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationEditService } from './application-edit.service';

describe('ApplicationEditService', () => {
  let service: ApplicationEditService;
  let mockSubmissionRepo: DeepMocked<Repository<ApplicationSubmission>>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;

  beforeEach(async () => {
    mockSubmissionRepo = createMock();
    mockAppSubmissionService = createMock();
    mockParcelService = createMock();
    mockAppOwnerService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationEditService,
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
      ],
    }).compile();

    service = module.get<ApplicationEditService>(ApplicationEditService);
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

    const draft = await service.getOrCreateDraft('fileNumber');

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(3);
    expect(mockSubmissionRepo.save).toHaveBeenCalledTimes(1);
    expect(draft).toBeDefined();
  });

  it('should delete a draft, attached parcels and owners', async () => {
    mockSubmissionRepo.findOne.mockResolvedValue(
      new ApplicationSubmission({
        owners: [],
        parcels: [],
      }),
    );

    mockSubmissionRepo.remove.mockResolvedValue(new ApplicationSubmission());
    mockParcelService.deleteMany.mockResolvedValueOnce([]);

    await service.deleteDraft('fileNumber');

    expect(mockSubmissionRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockSubmissionRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockParcelService.deleteMany).toHaveBeenCalledTimes(1);
  });

  it('should call through for mapToDto', async () => {
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValueOnce({} as any);

    const res = await service.mapToDetailedDto(new ApplicationSubmission());

    expect(mockAppSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res.canEdit).toBeTruthy();
  });
});
