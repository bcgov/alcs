import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationEditController } from './application-edit.controller';
import { ApplicationEditService } from './application-edit.service';

describe('ApplicationEditController', () => {
  let controller: ApplicationEditController;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockAppEditService: DeepMocked<ApplicationEditService>;

  beforeEach(async () => {
    mockAppSubmissionService = createMock();
    mockAppEditService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationEditController],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ApplicationEditService,
          useValue: mockAppEditService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationEditController>(
      ApplicationEditController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for getOrCreateDraft', async () => {
    mockAppEditService.getOrCreateDraft.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppEditService.mapToDetailedDto.mockResolvedValue({} as any);

    const submission = await controller.getOrCreateDraft('fileNumber');
    expect(submission).toBeDefined();

    expect(mockAppEditService.getOrCreateDraft).toHaveBeenCalledTimes(1);
    expect(mockAppEditService.mapToDetailedDto).toHaveBeenCalledTimes(1);
  });

  it('should call through for deleteDraft', async () => {
    mockAppEditService.deleteDraft.mockResolvedValue();

    await controller.deleteDraft('fileNumber');
    expect(mockAppEditService.deleteDraft).toHaveBeenCalledTimes(1);
  });
});
