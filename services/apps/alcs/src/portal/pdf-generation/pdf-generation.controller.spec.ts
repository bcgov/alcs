import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { User } from '../../user/user.entity';
import { GenerateReviewDocumentService } from './generate-review-document.service';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';
import { PdfGenerationController } from './pdf-generation.controller';

describe('PdfGenerationController', () => {
  let controller: PdfGenerationController;
  let mockSubmissionDocumentService: DeepMocked<GenerateSubmissionDocumentService>;
  let mockReviewDocumentService: DeepMocked<GenerateReviewDocumentService>;

  beforeEach(async () => {
    mockSubmissionDocumentService = createMock();
    mockReviewDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfGenerationController],
      providers: [
        {
          provide: GenerateSubmissionDocumentService,
          useValue: mockSubmissionDocumentService,
        },
        {
          provide: GenerateReviewDocumentService,
          useValue: mockReviewDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<PdfGenerationController>(PdfGenerationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully call service for generateSubmission', async () => {
    mockSubmissionDocumentService.generate.mockResolvedValue({
      data: 'fake',
    } as any);

    const mockResponse = createMock<DeepMocked<FastifyReply>>();

    await controller.generateSubmission(mockResponse, 'fake-id', {
      user: {
        entity: new User(),
      },
    });

    expect(mockSubmissionDocumentService.generate).toBeCalledTimes(1);
    expect(mockResponse.type).toBeCalledWith('application/pdf');
    expect(mockResponse.send).toBeCalledWith('fake');
  });

  it('should successfully call service for generateReview', async () => {
    mockReviewDocumentService.generate.mockResolvedValue({
      data: 'fake',
    } as any);

    const mockResponse = createMock<DeepMocked<FastifyReply>>();

    await controller.generateReview(mockResponse, 'fake-id', {
      user: {
        entity: new User(),
      },
    });

    expect(mockReviewDocumentService.generate).toBeCalledTimes(1);
    expect(mockResponse.type).toBeCalledWith('application/pdf');
    expect(mockResponse.send).toBeCalledWith('fake');
  });
});
