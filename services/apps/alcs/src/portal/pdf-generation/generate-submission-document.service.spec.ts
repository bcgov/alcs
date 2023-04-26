import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { ApplicationOwnerService } from '../application-submission/application-owner/application-owner.service';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';
import { Document } from '../../document/document.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('GenerateSubmissionDocumentService', () => {
  let service: GenerateSubmissionDocumentService;
  let mockCdogsService: DeepMocked<CdogsService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockApplicationOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockApplicationDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockCdogsService = createMock();
    mockApplicationSubmissionService = createMock();
    mockApplicationLocalGovernmentService = createMock();
    mockApplicationService = createMock();
    mockApplicationParcelService = createMock();
    mockApplicationOwnerService = createMock();
    mockApplicationDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateSubmissionDocumentService,
        { provide: CdogsService, useValue: mockCdogsService },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockApplicationLocalGovernmentService,
        },
        { provide: ApplicationService, useValue: mockApplicationService },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockApplicationOwnerService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockApplicationDocumentService,
        },
      ],
    }).compile();

    service = module.get<GenerateSubmissionDocumentService>(
      GenerateSubmissionDocumentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call cdogs service to generate pdf for nfu', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockApplicationSubmissionService.verifyAccessByFileId.mockResolvedValue({
      fileNumber: 'fake',
      localGovernmentUuid: 'fake-lg',
      typeCode: 'NFUP',
    } as ApplicationSubmission);
    mockApplicationDocumentService.list.mockResolvedValue([]);
    mockApplicationService.getOrFail.mockResolvedValue({
      type: { portalLabel: 'fake-label' },
    } as Application);
    mockApplicationLocalGovernmentService.getByUuid.mockResolvedValue(null);
    mockApplicationParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockApplicationOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });

    const res = await service.generate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockApplicationLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should call cdogs service to generate pdf for tur', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockApplicationSubmissionService.verifyAccessByFileId.mockResolvedValue({
      fileNumber: 'fake',
      localGovernmentUuid: 'fake-lg',
      typeCode: 'TURP',
    } as ApplicationSubmission);
    mockApplicationDocumentService.list.mockResolvedValue([]);
    mockApplicationService.getOrFail.mockResolvedValue({
      type: { portalLabel: 'fake-label' },
    } as Application);
    mockApplicationLocalGovernmentService.getByUuid.mockResolvedValue(null);
    mockApplicationParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockApplicationOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });

    const res = await service.generate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockApplicationLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should fail if wrong submission type used', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockApplicationSubmissionService.verifyAccessByFileId.mockResolvedValue({
      fileNumber: 'fake',
      localGovernmentUuid: 'fake-lg',
      typeCode: 'not a type',
    } as ApplicationSubmission);
    mockApplicationDocumentService.list.mockResolvedValue([]);
    mockApplicationService.getOrFail.mockResolvedValue({
      type: { portalLabel: 'fake-label' },
    } as Application);
    mockApplicationLocalGovernmentService.getByUuid.mockResolvedValue(null);
    mockApplicationParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockApplicationOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });

    await expect(service.generate('fake', userEntity)).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Could not find template for application submission type not a type`,
      ),
    );

    expect(mockCdogsService.generateDocument).toBeCalledTimes(0);
  });

  it('should clear visibility for existing submissions on update', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({
      status: HttpStatus.OK,
      data: [],
    } as any);

    mockApplicationSubmissionService.verifyAccessByFileId.mockResolvedValue({
      fileNumber: 'fake',
      localGovernmentUuid: 'fake-lg',
      typeCode: 'TURP',
    } as ApplicationSubmission);
    mockApplicationDocumentService.list.mockResolvedValue([
      new ApplicationDocument({
        typeCode: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
        document: new Document({
          source: DOCUMENT_SOURCE.APPLICANT,
          fileName: 'Cats',
        }),
      }),
      new ApplicationDocument({ document: new Document() }),
    ]);
    mockApplicationService.getOrFail.mockResolvedValue({
      type: { portalLabel: 'fake-label' },
    } as Application);
    mockApplicationLocalGovernmentService.getByUuid.mockResolvedValue(null);
    mockApplicationParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockApplicationOwnerService.fetchByApplicationFileId.mockResolvedValue([]);
    const user = { user: { entity: 'Bruce' } };
    const userEntity = new User({
      name: user.user.entity,
    });
    mockApplicationDocumentService.update.mockResolvedValue();
    mockApplicationDocumentService.attachDocumentAsBuffer.mockResolvedValue(
      new ApplicationDocument(),
    );

    await service.generateUpdate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockApplicationDocumentService.update).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationDocumentService.update.mock.calls[0][0].visibilityFlags,
    ).toEqual([]);
    expect(mockApplicationLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(
      mockApplicationDocumentService.attachDocumentAsBuffer,
    ).toHaveBeenCalledTimes(1);
  });
});
