import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentType } from '../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { User } from '../../user/user.entity';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelService } from '../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import { GenerateNoiSubmissionDocumentService } from './generate-noi-submission-document.service';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('GenerateNoiSubmissionDocumentService', () => {
  let service: GenerateNoiSubmissionDocumentService;
  let mockCdogsService: DeepMocked<CdogsService>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoiLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNoinOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  let mockSubmissionStatus;

  beforeEach(async () => {
    mockCdogsService = createMock();
    mockNoiSubmissionService = createMock();
    mockNoiLocalGovernmentService = createMock();
    mockNoiService = createMock();
    mockNoiParcelService = createMock();
    mockNoinOwnerService = createMock();
    mockNoiDocumentService = createMock();

    mockNoiLocalGovernmentService.getByUuid.mockResolvedValue(
      new LocalGovernment(),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateNoiSubmissionDocumentService,
        { provide: CdogsService, useValue: mockCdogsService },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockNoiLocalGovernmentService,
        },
        { provide: NoticeOfIntentService, useValue: mockNoiService },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockNoinOwnerService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
    }).compile();

    mockSubmissionStatus = new NoticeOfIntentSubmissionToSubmissionStatus({
      statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
      submissionUuid: 'fake',
    });

    service = module.get<GenerateNoiSubmissionDocumentService>(
      GenerateNoiSubmissionDocumentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call cdogs service to generate pdf for pfrs', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockNoiSubmissionService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission({
        fileNumber: 'fake',
        localGovernmentUuid: 'fake-lg',
        typeCode: 'PFRS',
        status: mockSubmissionStatus,
        soilProposedStructures: [],
      }),
    );
    mockNoiDocumentService.list.mockResolvedValue([]);
    mockNoiService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntent({
        type: new NoticeOfIntentType({ portalLabel: 'fake-label' }),
      }),
    );
    mockNoiParcelService.fetchByFileId.mockResolvedValue([]);
    mockNoinOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });

    const res = await service.generate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockNoiLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should fail if wrong submission type used', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockNoiSubmissionService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission({
        fileNumber: 'fake',
        localGovernmentUuid: 'fake-lg',
        typeCode: 'not a type',
        status: mockSubmissionStatus,
        soilProposedStructures: [],
      }),
    );
    mockNoiDocumentService.list.mockResolvedValue([]);
    mockNoiService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntent({
        type: new NoticeOfIntentType({ portalLabel: 'fake-label' }),
      }),
    );
    mockNoiParcelService.fetchByFileId.mockResolvedValue([]);
    mockNoinOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });

    const res = await service.generate('fake', userEntity);

    expect(res).toBeUndefined();
    expect(mockCdogsService.generateDocument).toBeCalledTimes(0);
  });

  it('should clear visibility for existing submissions on update', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({
      status: HttpStatus.OK,
      data: [],
    } as any);

    mockNoiSubmissionService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission({
        fileNumber: 'fake',
        localGovernmentUuid: 'fake-lg',
        typeCode: 'PFRS',
        status: mockSubmissionStatus,
        soilProposedStructures: [],
      }),
    );
    mockNoiDocumentService.list.mockResolvedValue([
      new NoticeOfIntentDocument({
        typeCode: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
        document: new Document({
          source: DOCUMENT_SOURCE.APPLICANT,
          fileName: 'Cats',
        }),
      }),
      new NoticeOfIntentDocument({ document: new Document() }),
    ]);
    mockNoiService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntent({
        type: new NoticeOfIntentType({ portalLabel: 'fake-label' }),
      }),
    );
    mockNoiParcelService.fetchByFileId.mockResolvedValue([]);
    mockNoinOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });
    mockNoiDocumentService.update.mockResolvedValue(
      new NoticeOfIntentDocument(),
    );
    mockNoiDocumentService.attachDocumentAsBuffer.mockResolvedValue(
      new NoticeOfIntentDocument(),
    );

    await service.generateUpdate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockNoiDocumentService.update).toHaveBeenCalledTimes(1);
    expect(
      mockNoiDocumentService.update.mock.calls[0][0].visibilityFlags,
    ).toEqual([]);
    expect(mockNoiLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(mockNoiDocumentService.attachDocumentAsBuffer).toHaveBeenCalledTimes(
      1,
    );
  });
});
