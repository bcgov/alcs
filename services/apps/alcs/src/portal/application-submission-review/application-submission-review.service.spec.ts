import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import {
  DocumentCode,
  DOCUMENT_TYPE,
} from '../../document/document-code.entity';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationSubmissionReviewProfile } from '../../common/automapper/application-submission-review.automapper.profile';
import { User } from '../../user/user.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';

import { ApplicationSubmissionReview } from './application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

describe('ApplicationSubmissionReviewService', () => {
  let service: ApplicationSubmissionReviewService;
  let mockRepository: DeepMocked<Repository<ApplicationSubmissionReview>>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppService: DeepMocked<ApplicationService>;

  const mockLocalGovernment = new ApplicationLocalGovernment({
    isFirstNation: true,
    isActive: true,
  });

  beforeEach(async () => {
    mockRepository = createMock();
    mockAppDocumentService = createMock();
    mockAppService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationSubmissionReviewService,
        ApplicationSubmissionReviewProfile,
        {
          provide: getRepositoryToken(ApplicationSubmissionReview),
          useValue: mockRepository,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    service = module.get<ApplicationSubmissionReviewService>(
      ApplicationSubmissionReviewService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through for get', async () => {
    const appReview = new ApplicationSubmissionReview();
    mockRepository.findOneOrFail.mockResolvedValue(appReview);

    const res = await service.getByFileNumber('');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toBe(appReview);
  });

  it('should call save for startReview', async () => {
    const appReview = new ApplicationSubmissionReview();
    mockRepository.save.mockResolvedValue(appReview);

    const res = await service.startReview(
      new ApplicationSubmission(),
      new User(),
    );

    expect(res).toBe(appReview);
  });

  it('should call save for update', async () => {
    const appReview = new ApplicationSubmissionReview();
    mockRepository.findOneOrFail.mockResolvedValue(appReview);
    mockRepository.save.mockResolvedValue({} as any);

    const res = await service.update('', {});

    expect(res).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should delete the staff report and the resolution document when there is no ocp or zoning for update', async () => {
    const appReview = new ApplicationSubmissionReview({
      application: new Application({ uuid: 'fake' }),
    });
    mockRepository.findOneOrFail.mockResolvedValue(appReview);
    mockAppDocumentService.deleteByType.mockResolvedValue({} as any);
    mockRepository.save.mockResolvedValue({} as any);
    mockAppService.getUuid.mockResolvedValue('');

    const res = await service.update('', {
      isOCPDesignation: false,
      isSubjectToZoning: false,
    });

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(mockAppDocumentService.deleteByType).toHaveBeenCalledTimes(2);
    expect(mockAppService.getUuid).toHaveBeenCalledTimes(1);
  });

  it('should call remove for delete', async () => {
    const appReview = new ApplicationSubmissionReview();
    mockRepository.remove.mockResolvedValue(appReview);

    await service.delete(appReview);

    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception for when verifying an incomplete review', () => {
    const appReview = new ApplicationSubmissionReview();

    expect(() => {
      service.verifyComplete(appReview, [], false);
    }).toThrow(new BaseServiceException('Contact information not complete'));
  });

  it('should throw an ocp exception for when verifying a review with just contact info', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: null,
    });

    expect(() => {
      service.verifyComplete(appReview, [], false);
    }).toThrow(new BaseServiceException('OCP information not complete'));
  });

  it('should throw a zoning exception for when review has zoning null', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: false,
      isSubjectToZoning: null,
    });

    expect(() => {
      service.verifyComplete(appReview, [], false);
    }).toThrow(new BaseServiceException('Zoning information not complete'));
  });

  it('should throw an authorized exception when review is missing authorized', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: true,
      OCPDesignation: 'designation',
      OCPConsistent: true,
      OCPBylawName: 'bylaw',
      isSubjectToZoning: false,
      isAuthorized: null,
    });

    expect(() => {
      service.verifyComplete(appReview, [], false);
    }).toThrow(
      new BaseServiceException('Review authorization needs to be set'),
    );
  });

  it('should throw an exception when application is missing staff report', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: true,
      OCPDesignation: 'designation',
      OCPConsistent: true,
      OCPBylawName: 'bylaw',
      isSubjectToZoning: false,
      isAuthorized: true,
    });

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      }),
    ];

    expect(() => {
      service.verifyComplete(appReview, documents, false);
    }).toThrow(
      new BaseServiceException('Review missing staff report document'),
    );
  });

  it('should return the completed review when its authorized and has correct files', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: true,
      OCPDesignation: 'designation',
      OCPConsistent: true,
      OCPBylawName: 'bylaw',
      isSubjectToZoning: false,
      isAuthorized: true,
    });

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      }),
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.STAFF_REPORT,
        }),
      }),
    ];

    const completedReview = service.verifyComplete(appReview, documents, false);

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should not require a staff report if the application was not authorized', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: true,
      OCPDesignation: 'designation',
      OCPConsistent: true,
      OCPBylawName: 'bylaw',
      isSubjectToZoning: false,
      isAuthorized: false,
    });

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      }),
    ];

    const completedReview = service.verifyComplete(appReview, documents, false);

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should allow null authorization if both ocp and zoning are false', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: false,
      isSubjectToZoning: false,
      isAuthorized: null,
    });

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      }),
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.STAFF_REPORT,
        }),
      }),
    ];

    const completedReview = service.verifyComplete(appReview, documents, false);

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should return the completed review when its valid and first nations', () => {
    const appReview = new ApplicationSubmissionReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isAuthorized: true,
    });

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      }),
    ];

    const completedReview = service.verifyComplete(appReview, documents, true);

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should map in the local government first nation flag when mapping dto', async () => {
    const res = await service.mapToDto(
      new ApplicationSubmissionReview(),
      mockLocalGovernment,
    );

    expect(res.isFirstNationGovernment).toBeTruthy();
  });
});
