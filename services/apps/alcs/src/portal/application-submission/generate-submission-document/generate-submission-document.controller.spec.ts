import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { User } from '../../../user/user.entity';
import { GenerateSubmissionDocumentController } from './generate-submission-document.controller';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';

describe('GenerateSubmissionDocumentController', () => {
  let controller: GenerateSubmissionDocumentController;
  let mockGenerateSubmissionDocumentService: DeepMocked<GenerateSubmissionDocumentService>;

  beforeEach(async () => {
    mockGenerateSubmissionDocumentService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GenerateSubmissionDocumentService,
          useValue: mockGenerateSubmissionDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [GenerateSubmissionDocumentController],
    }).compile();

    controller = module.get<GenerateSubmissionDocumentController>(
      GenerateSubmissionDocumentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully call service', async () => {
    mockGenerateSubmissionDocumentService.generate.mockResolvedValue({
      data: 'fake',
    } as any);

    const mockResponse = createMock<DeepMocked<FastifyReply>>();

    await controller.generateDocument(mockResponse, 'fake-id', {
      user: {
        entity: new User(),
      },
    });

    expect(mockGenerateSubmissionDocumentService.generate).toBeCalledTimes(1);
    expect(mockResponse.type).toBeCalledWith('application/pdf');
    expect(mockResponse.send).toBeCalledWith('fake');
  });
});
