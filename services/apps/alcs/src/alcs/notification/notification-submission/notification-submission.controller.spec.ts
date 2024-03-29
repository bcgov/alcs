import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { Document } from '../../../document/document.entity';
import { DocumentService } from '../../../document/document.service';
import { NotificationSubmissionDetailedDto } from '../../../portal/notification-submission/notification-submission.dto';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationSubmissionService } from '../../../portal/notification-submission/notification-submission.service';
import { User } from '../../../user/user.entity';
import { NotificationSubmissionController } from './notification-submission.controller';

describe('NotificationSubmissionController', () => {
  let controller: NotificationSubmissionController;

  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();
    mockDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSubmissionController],
      providers: [
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
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

    controller = module.get<NotificationSubmissionController>(
      NotificationSubmissionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call NotificationSubmissionService to get Notice of Intent Submission', async () => {
    const fakeFileNumber = 'fake';

    mockNotificationSubmissionService.getByFileNumber.mockResolvedValue(
      new NotificationSubmission({
        fileNumber: fakeFileNumber,
      }),
    );
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      createMock<NotificationSubmissionDetailedDto>(),
    );

    const result = await controller.get(fakeFileNumber, {
      user: {
        entity: new User(),
      },
    });

    expect(mockNotificationSubmissionService.getByFileNumber).toBeCalledTimes(
      1,
    );
    expect(mockNotificationSubmissionService.mapToDetailedDTO).toBeCalledTimes(
      1,
    );
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

  it('should call through to service for updating email', async () => {
    mockNotificationSubmissionService.getUuid.mockResolvedValue('uuid');
    mockNotificationSubmissionService.update.mockResolvedValue(
      new NotificationSubmission(),
    );
    mockNotificationSubmissionService.getByFileNumber.mockResolvedValue(
      new NotificationSubmission({
        fileNumber: 'fileNumber',
      }),
    );
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      createMock<NotificationSubmissionDetailedDto>(),
    );

    await controller.update('fileNumber', 'email', {
      user: {
        entity: new User(),
      },
    });

    expect(mockNotificationSubmissionService.getUuid).toBeCalledTimes(1);
    expect(mockNotificationSubmissionService.update).toBeCalledTimes(1);
  });
});
