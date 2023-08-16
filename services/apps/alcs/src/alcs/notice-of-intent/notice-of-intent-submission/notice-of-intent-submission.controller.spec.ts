import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DocumentService } from '../../../document/document.service';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { AlcsNoticeOfIntentSubmissionDto } from '../notice-of-intent.dto';
import { NoticeOfIntentSubmissionController } from './notice-of-intent-submission.controller';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';
import { Document } from '../../../document/document.entity';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';

describe('NoticeOfIntentSubmissionController', () => {
  let controller: NoticeOfIntentSubmissionController;

  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionService = createMock();
    mockDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentSubmissionController],
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentSubmissionController>(
      NoticeOfIntentSubmissionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call NoticeOfIntentSubmissionService to get Notice of Intent Submission', async () => {
    const fakeFileNumber = 'fake';

    mockNoticeOfIntentSubmissionService.get.mockResolvedValue({
      fileNumber: fakeFileNumber,
    } as NoticeOfIntentSubmission);
    mockNoticeOfIntentSubmissionService.mapToDto.mockResolvedValue(
      createMock<AlcsNoticeOfIntentSubmissionDto>(),
    );

    const result = await controller.get(fakeFileNumber);

    expect(mockNoticeOfIntentSubmissionService.get).toBeCalledTimes(1);
    expect(mockNoticeOfIntentSubmissionService.mapToDto).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should call documentService to get inline download url Submission', async () => {
    const fakeDownloadUrl = 'fake_download';
    const fakeUuid = 'fake';

    mockDocumentService.getDocument.mockResolvedValue({} as Document);
    mockDocumentService.getDownloadUrl.mockResolvedValue(fakeDownloadUrl);

    const result = await controller.downloadFile(fakeUuid);

    expect(mockDocumentService.getDocument).toBeCalledTimes(1);
    expect(mockDocumentService.getDownloadUrl).toBeCalledTimes(1);
    expect(mockDocumentService.getDocument).toBeCalledWith(fakeUuid);
    expect(mockDocumentService.getDownloadUrl).toBeCalledWith(
      {} as Document,
      true,
    );
    expect(result).toEqual({ url: fakeDownloadUrl });
  });
});
