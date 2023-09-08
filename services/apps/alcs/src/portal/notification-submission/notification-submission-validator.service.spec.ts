import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { NotificationParcel } from './notification-parcel/notification-parcel.entity';
import { NotificationParcelService } from './notification-parcel/notification-parcel.service';
import { NotificationSubmissionValidatorService } from './notification-submission-validator.service';
import { NotificationSubmission } from './notification-submission.entity';

function includesError(errors: Error[], target: Error) {
  return errors.some((error) => error.message === target.message);
}

describe('NotificationSubmissionValidatorService', () => {
  let service: NotificationSubmissionValidatorService;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockParcelService: DeepMocked<NotificationParcelService>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;

  beforeEach(async () => {
    mockLGService = createMock();
    mockParcelService = createMock();
    mockNotificationDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSubmissionValidatorService,
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: NotificationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
      ],
    }).compile();

    mockLGService.list.mockResolvedValue([]);
    mockParcelService.fetchByFileId.mockResolvedValue([]);
    mockNotificationDocumentService.getApplicantDocuments.mockResolvedValue([]);

    service = module.get<NotificationSubmissionValidatorService>(
      NotificationSubmissionValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an error for missing applicant', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('should return an error for missing purpose', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(includesError(res.errors, new Error('Missing purpose'))).toBe(true);
  });

  it('should return an error for no parcels', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('provide errors for invalid parcel', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});
    const parcel = new NotificationParcel({
      uuid: 'parcel-1',
      ownershipTypeCode: 'SMPL',
      legalDescription: null,
    });

    mockParcelService.fetchByFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Invalid Parcel ${parcel.uuid}`),
      ),
    ).toBe(true);
    expect(
      includesError(
        res.errors,
        new ServiceValidationException(
          `Fee Simple Parcel ${parcel.uuid} has no PID`,
        ),
      ),
    ).toBe(true);
  });

  it('should report an invalid PID', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});
    const parcel = new NotificationParcel({
      uuid: 'parcel-1',
      ownershipTypeCode: 'SMPL',
      pid: '1251251',
    });

    mockParcelService.fetchByFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Parcel ${parcel.uuid} has invalid PID`),
      ),
    ).toBe(true);
  });

  it('should return an error for invalid primary contact', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Invalid Primary Contact Information`),
      ),
    ).toBe(true);
  });

  it('should return an error for incomplete proposal', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({
      typeCode: 'SRW',
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(res.errors, new Error(`Incomplete Proposal Information`)),
    ).toBe(true);
    expect(
      includesError(res.errors, new Error(`SRW proposal missing SRW Terms`)),
    ).toBe(true);
  });

  it('should produce an error for missing local government', async () => {
    const noticeOfIntentSubmission = new NotificationSubmission({});

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error('Notification has no local government'),
      ),
    ).toBe(true);
  });

  it('should accept local government when its valid', async () => {
    const mockLg = new LocalGovernment({
      uuid: 'lg-uuid',
      name: 'lg',
      bceidBusinessGuid: 'CATS',
      isFirstNation: false,
    });
    mockLGService.list.mockResolvedValue([mockLg]);

    const noticeOfIntentSubmission = new NotificationSubmission({
      localGovernmentUuid: mockLg.uuid,
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(
          `Selected local government is setup in portal ${mockLg.name}`,
        ),
      ),
    ).toBe(false);
  });

  it('should report error for document missing type', async () => {
    const incompleteDocument = new NotificationDocument({
      type: undefined,
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });

    const documents = [incompleteDocument];
    mockNotificationDocumentService.getApplicantDocuments.mockResolvedValue(
      documents,
    );

    const noticeOfIntentSubmission = new NotificationSubmission({});

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing type`),
      ),
    ).toBe(true);
  });

  it('should report error for other document missing description', async () => {
    const incompleteDocument = new NotificationDocument({
      type: new DocumentCode({
        code: DOCUMENT_TYPE.OTHER,
      }),
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
      description: undefined,
    });
    const noticeOfIntentSubmission = new NotificationSubmission({});

    const documents = [incompleteDocument];
    mockNotificationDocumentService.getApplicantDocuments.mockResolvedValue(
      documents,
    );

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing description`),
      ),
    ).toBe(true);
  });
});
