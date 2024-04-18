import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { VISIBILITY_FLAG } from '../../alcs/notification/notification-document/notification-document.entity';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { FALLBACK_APPLICANT_NAME } from '../../utils/owner.constants';
import { filterUndefined } from '../../utils/undefined';
import { GenerateNoiSubmissionDocumentService } from '../pdf-generation/generate-noi-submission-document.service';
import { ValidatedNoticeOfIntentSubmission } from './notice-of-intent-submission-validator.service';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';
import {
  NoticeOfIntentSubmission,
  PORTAL_TO_ALCS_STRUCTURE_MAP,
} from './notice-of-intent-submission.entity';

@Injectable()
export class NoticeOfIntentSubmissionService {
  private logger: Logger = new Logger(NoticeOfIntentSubmissionService.name);

  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentSubmission> = {
    createdBy: true,
    owners: {
      type: true,
      corporateSummary: {
        document: true,
      },
      parcels: true,
    },
  };

  constructor(
    @InjectRepository(NoticeOfIntentSubmission)
    private noticeOfIntentSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    @InjectRepository(NoticeOfIntentSubmissionStatusType)
    private noticeOfIntentStatusRepository: Repository<NoticeOfIntentSubmissionStatusType>,
    private noticeOfIntentService: NoticeOfIntentService,
    @Inject(forwardRef(() => GenerateNoiSubmissionDocumentService))
    private generateNoiSubmissionDocumentService: GenerateNoiSubmissionDocumentService,
    private localGovernmentService: LocalGovernmentService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private fileNumberService: FileNumberService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFailByFileNumber(fileNumber: string) {
    return await this.noticeOfIntentSubmissionRepository.findOneOrFail({
      where: {
        fileNumber,
        isDraft: false,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async create(type: string, createdBy: User) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();

    await this.noticeOfIntentService.create({
      fileNumber,
      applicant: FALLBACK_APPLICANT_NAME,
      typeCode: type,
      source: 'APPLICANT',
    });

    const noiSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      typeCode: type,
      createdBy,
    });

    const savedSubmission =
      await this.noticeOfIntentSubmissionRepository.save(noiSubmission);

    await this.noticeOfIntentSubmissionStatusService.setInitialStatuses(
      savedSubmission.uuid,
    );

    return fileNumber;
  }

  async update(
    submissionUuid: string,
    updateDto: NoticeOfIntentSubmissionUpdateDto,
    user: User,
  ) {
    const noticeOfIntentSubmission = await this.getByUuid(submissionUuid, user);

    noticeOfIntentSubmission.applicant = updateDto.applicant;
    noticeOfIntentSubmission.purpose = filterUndefined(
      updateDto.purpose,
      noticeOfIntentSubmission.purpose,
    );
    noticeOfIntentSubmission.typeCode =
      updateDto.typeCode || noticeOfIntentSubmission.typeCode;
    noticeOfIntentSubmission.localGovernmentUuid =
      updateDto.localGovernmentUuid;

    this.setLandUseFields(noticeOfIntentSubmission, updateDto);
    await this.setSoilFields(noticeOfIntentSubmission, updateDto);

    await this.noticeOfIntentSubmissionRepository.save(
      noticeOfIntentSubmission,
    );

    if (!noticeOfIntentSubmission.isDraft && updateDto.localGovernmentUuid) {
      await this.noticeOfIntentService.update(
        noticeOfIntentSubmission.fileNumber,
        {
          localGovernmentUuid: updateDto.localGovernmentUuid,
        },
      );
    }

    if (!noticeOfIntentSubmission.isDraft && updateDto.typeCode) {
      await this.noticeOfIntentService.update(
        noticeOfIntentSubmission.fileNumber,
        {
          typeCode: updateDto.typeCode,
        },
      );
    }
    return this.getByUuid(submissionUuid, user);
  }

  async getFileNumber(submissionUuid: string, includeDraft = false) {
    const submission = await this.noticeOfIntentSubmissionRepository.findOne({
      where: {
        uuid: submissionUuid,
        isDraft: includeDraft,
      },
      select: {
        uuid: true,
        fileNumber: true,
      },
    });
    return submission?.fileNumber;
  }

  async getAllByUser(user: User) {
    const whereClauses = await this.generateWhereClauses({}, user);

    return this.noticeOfIntentSubmissionRepository.find({
      where: whereClauses,
      order: {
        auditUpdatedAt: 'DESC',
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByFileNumber(fileNumber: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.getOrFailByFileNumber(fileNumber);
    }

    const whereClauses = await this.generateWhereClauses(
      {
        fileNumber,
      },
      user,
    );

    return this.noticeOfIntentSubmissionRepository.findOneOrFail({
      where: whereClauses,
      order: {
        auditUpdatedAt: 'DESC',
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByUuid(uuid: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.noticeOfIntentSubmissionRepository.findOneOrFail({
        where: {
          uuid,
        },
        relations: {
          ...this.DEFAULT_RELATIONS,
        },
      });
    }

    const findOptions = await this.generateWhereClauses(
      {
        uuid,
      },
      user,
    );

    return this.noticeOfIntentSubmissionRepository.findOneOrFail({
      where: findOptions,
      relations: {
        ...this.DEFAULT_RELATIONS,
      },
      order: {
        auditUpdatedAt: 'DESC',
      },
    });
  }

  private async generateWhereClauses(
    searchOptions: FindOptionsWhere<NoticeOfIntentSubmission>,
    user: User,
  ) {
    const searchQueries: FindOptionsWhere<NoticeOfIntentSubmission>[] = [];

    searchQueries.push({
      ...searchOptions,
      createdBy: {
        uuid: user.uuid,
      },
      isDraft: false,
    });

    if (user.bceidBusinessGuid) {
      searchQueries.push({
        ...searchOptions,
        createdBy: {
          bceidBusinessGuid: user.bceidBusinessGuid,
        },
        isDraft: false,
      });

      const matchingLocalGovernment =
        await this.localGovernmentService.getByGuid(user.bceidBusinessGuid);
      if (matchingLocalGovernment) {
        searchQueries.push({
          ...searchOptions,
          localGovernmentUuid: matchingLocalGovernment.uuid,
          isDraft: false,
          noticeOfIntent: {
            dateSubmittedToAlc: Not(IsNull()),
          },
        });
      }
    }

    return searchQueries;
  }

  async mapToDTOs(submissions: NoticeOfIntentSubmission[], user: User) {
    const types = await this.noticeOfIntentService.listTypes();

    return submissions.map((noiSubmission) => {
      const isCreator = noiSubmission.createdBy.uuid === user.uuid;
      const isSameAccount =
        user.bceidBusinessGuid &&
        noiSubmission.createdBy.bceidBusinessGuid === user.bceidBusinessGuid;

      return {
        ...this.mapper.map(
          noiSubmission,
          NoticeOfIntentSubmission,
          NoticeOfIntentSubmissionDto,
        ),
        type: types.find((type) => type.code === noiSubmission.typeCode)!.label,
        canEdit:
          [NOI_SUBMISSION_STATUS.IN_PROGRESS].includes(
            noiSubmission.status.statusTypeCode as NOI_SUBMISSION_STATUS,
          ) &&
          (isCreator || isSameAccount),
        canView: true,
      };
    });
  }

  async mapToDetailedDTO(noiSubmission: NoticeOfIntentSubmission, user: User) {
    const types = await this.noticeOfIntentService.listTypes();
    const mappedApp = this.mapper.map(
      noiSubmission,
      NoticeOfIntentSubmission,
      NoticeOfIntentSubmissionDetailedDto,
    );
    const isCreator = noiSubmission.createdBy.uuid === user.uuid;
    const isSameAccount =
      user.bceidBusinessGuid &&
      noiSubmission.createdBy.bceidBusinessGuid === user.bceidBusinessGuid;

    return {
      ...mappedApp,
      type: types.find((type) => type.code === noiSubmission.typeCode)!.label,
      canEdit:
        [NOI_SUBMISSION_STATUS.IN_PROGRESS].includes(
          noiSubmission.status.statusTypeCode as NOI_SUBMISSION_STATUS,
        ) &&
        (isCreator || isSameAccount),
      canView: true,
    };
  }

  async submitToAlcs(
    noticeOfIntentSubmission: ValidatedNoticeOfIntentSubmission,
    user: User,
  ) {
    try {
      const subtypes = this.populateNoiSubtype(noticeOfIntentSubmission);

      const submittedNoi = await this.noticeOfIntentService.submit({
        fileNumber: noticeOfIntentSubmission.fileNumber,
        applicant: noticeOfIntentSubmission.applicant,
        localGovernmentUuid: noticeOfIntentSubmission.localGovernmentUuid,
        typeCode: noticeOfIntentSubmission.typeCode,
        dateSubmittedToAlc: new Date(),
        subtypes,
      });

      await this.noticeOfIntentSubmissionStatusService.setStatusDate(
        noticeOfIntentSubmission.uuid,
        NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        submittedNoi.dateSubmittedToAlc,
      );

      await this.generateNoiSubmissionDocumentService.generateAndAttach(
        submittedNoi.fileNumber,
        user,
      );

      return submittedNoi;
    } catch (ex) {
      this.logger.error(ex);
      throw new BaseServiceException(
        `Failed to submit notice of intent: ${noticeOfIntentSubmission.fileNumber}`,
      );
    }
  }

  private populateNoiSubtype(
    noticeOfIntentSubmission: ValidatedNoticeOfIntentSubmission,
  ) {
    const subtypes: string[] = [];

    const structureTypes =
      noticeOfIntentSubmission.soilProposedStructures.reduce((map, value) => {
        if (value.type) {
          map.add(value.type);
        }
        return map;
      }, new Set<string>());

    for (const type of structureTypes.values()) {
      subtypes.push(PORTAL_TO_ALCS_STRUCTURE_MAP[type]);
    }

    if (noticeOfIntentSubmission.soilIsAreaWideFilling) {
      subtypes.push('ARWF');
    }

    if (noticeOfIntentSubmission.soilIsExtractionOrMining) {
      subtypes.push('AEPM');
    }

    return subtypes;
  }

  async updateStatus(
    uuid: string,
    statusCode: NOI_SUBMISSION_STATUS,
    effectiveDate?: Date | null,
  ) {
    const submission = await this.loadBarebonesSubmission(uuid);
    await this.noticeOfIntentSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
      effectiveDate,
    );
  }

  async getStatus(code: NOI_SUBMISSION_STATUS) {
    return await this.noticeOfIntentStatusRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async cancel(noticeOfIntentSubmission: NoticeOfIntentSubmission) {
    return await this.noticeOfIntentSubmissionStatusService.setStatusDate(
      noticeOfIntentSubmission.uuid,
      NOI_SUBMISSION_STATUS.CANCELLED,
    );
  }

  async setPrimaryContact(
    submissionUuid: string,
    primaryContactUuid: any,
    user: User,
  ) {
    const noticeOfIntentSubmission = await this.getByUuid(submissionUuid, user);
    noticeOfIntentSubmission.primaryContactOwnerUuid = primaryContactUuid;
    await this.noticeOfIntentSubmissionRepository.save(
      noticeOfIntentSubmission,
    );
  }

  private loadBarebonesSubmission(uuid: string) {
    //Load submission without relations to prevent save from crazy cascading
    return this.noticeOfIntentSubmissionRepository.findOneOrFail({
      where: {
        uuid,
      },
    });
  }

  private setLandUseFields(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    updateDto: NoticeOfIntentSubmissionUpdateDto,
  ) {
    noticeOfIntentSubmission.parcelsAgricultureDescription =
      updateDto.parcelsAgricultureDescription;
    noticeOfIntentSubmission.parcelsAgricultureImprovementDescription =
      updateDto.parcelsAgricultureImprovementDescription;
    noticeOfIntentSubmission.parcelsNonAgricultureUseDescription =
      updateDto.parcelsNonAgricultureUseDescription;
    noticeOfIntentSubmission.northLandUseType = updateDto.northLandUseType;
    noticeOfIntentSubmission.northLandUseTypeDescription =
      updateDto.northLandUseTypeDescription;
    noticeOfIntentSubmission.eastLandUseType = updateDto.eastLandUseType;
    noticeOfIntentSubmission.eastLandUseTypeDescription =
      updateDto.eastLandUseTypeDescription;
    noticeOfIntentSubmission.southLandUseType = updateDto.southLandUseType;
    noticeOfIntentSubmission.southLandUseTypeDescription =
      updateDto.southLandUseTypeDescription;
    noticeOfIntentSubmission.westLandUseType = updateDto.westLandUseType;
    noticeOfIntentSubmission.westLandUseTypeDescription =
      updateDto.westLandUseTypeDescription;

    return noticeOfIntentSubmission;
  }

  private async setSoilFields(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    updateDto: NoticeOfIntentSubmissionUpdateDto,
  ) {
    noticeOfIntentSubmission.soilIsFollowUp = filterUndefined(
      updateDto.soilIsFollowUp,
      noticeOfIntentSubmission.soilIsFollowUp,
    );
    noticeOfIntentSubmission.soilFollowUpIDs = filterUndefined(
      updateDto.soilFollowUpIDs,
      noticeOfIntentSubmission.soilFollowUpIDs,
    );
    noticeOfIntentSubmission.soilTypeRemoved = filterUndefined(
      updateDto.soilTypeRemoved,
      noticeOfIntentSubmission.soilTypeRemoved,
    );
    noticeOfIntentSubmission.soilToRemoveVolume = filterUndefined(
      updateDto.soilToRemoveVolume,
      noticeOfIntentSubmission.soilToRemoveVolume,
    );
    noticeOfIntentSubmission.soilToRemoveArea = filterUndefined(
      updateDto.soilToRemoveArea,
      noticeOfIntentSubmission.soilToRemoveArea,
    );
    noticeOfIntentSubmission.soilToRemoveMaximumDepth = filterUndefined(
      updateDto.soilToRemoveMaximumDepth,
      noticeOfIntentSubmission.soilToRemoveMaximumDepth,
    );
    noticeOfIntentSubmission.soilToRemoveAverageDepth = filterUndefined(
      updateDto.soilToRemoveAverageDepth,
      noticeOfIntentSubmission.soilToRemoveAverageDepth,
    );
    noticeOfIntentSubmission.soilAlreadyRemovedVolume = filterUndefined(
      updateDto.soilAlreadyRemovedVolume,
      noticeOfIntentSubmission.soilAlreadyRemovedVolume,
    );
    noticeOfIntentSubmission.soilAlreadyRemovedArea = filterUndefined(
      updateDto.soilAlreadyRemovedArea,
      noticeOfIntentSubmission.soilAlreadyRemovedArea,
    );
    noticeOfIntentSubmission.soilAlreadyRemovedMaximumDepth = filterUndefined(
      updateDto.soilAlreadyRemovedMaximumDepth,
      noticeOfIntentSubmission.soilAlreadyRemovedMaximumDepth,
    );
    noticeOfIntentSubmission.soilAlreadyRemovedAverageDepth = filterUndefined(
      updateDto.soilAlreadyRemovedAverageDepth,
      noticeOfIntentSubmission.soilAlreadyRemovedAverageDepth,
    );
    noticeOfIntentSubmission.soilToPlaceVolume = filterUndefined(
      updateDto.soilToPlaceVolume,
      noticeOfIntentSubmission.soilToPlaceVolume,
    );
    noticeOfIntentSubmission.soilToPlaceArea = filterUndefined(
      updateDto.soilToPlaceArea,
      noticeOfIntentSubmission.soilToPlaceArea,
    );
    noticeOfIntentSubmission.soilToPlaceMaximumDepth = filterUndefined(
      updateDto.soilToPlaceMaximumDepth,
      noticeOfIntentSubmission.soilToPlaceMaximumDepth,
    );
    noticeOfIntentSubmission.soilToPlaceAverageDepth = filterUndefined(
      updateDto.soilToPlaceAverageDepth,
      noticeOfIntentSubmission.soilToPlaceAverageDepth,
    );
    noticeOfIntentSubmission.soilAlreadyPlacedVolume = filterUndefined(
      updateDto.soilAlreadyPlacedVolume,
      noticeOfIntentSubmission.soilAlreadyPlacedVolume,
    );
    noticeOfIntentSubmission.soilAlreadyPlacedArea = filterUndefined(
      updateDto.soilAlreadyPlacedArea,
      noticeOfIntentSubmission.soilAlreadyPlacedArea,
    );
    noticeOfIntentSubmission.soilAlreadyPlacedMaximumDepth = filterUndefined(
      updateDto.soilAlreadyPlacedMaximumDepth,
      noticeOfIntentSubmission.soilAlreadyPlacedMaximumDepth,
    );
    noticeOfIntentSubmission.soilAlreadyPlacedAverageDepth = filterUndefined(
      updateDto.soilAlreadyPlacedAverageDepth,
      noticeOfIntentSubmission.soilAlreadyPlacedAverageDepth,
    );
    noticeOfIntentSubmission.soilProjectDuration = filterUndefined(
      updateDto.soilProjectDuration,
      noticeOfIntentSubmission.soilProjectDuration,
    );
    noticeOfIntentSubmission.fillProjectDuration = filterUndefined(
      updateDto.fillProjectDuration,
      noticeOfIntentSubmission.fillProjectDuration,
    );
    noticeOfIntentSubmission.soilFillTypeToPlace = filterUndefined(
      updateDto.soilFillTypeToPlace,
      noticeOfIntentSubmission.soilFillTypeToPlace,
    );

    noticeOfIntentSubmission.soilIsExtractionOrMining = filterUndefined(
      updateDto.soilIsExtractionOrMining,
      noticeOfIntentSubmission.soilIsExtractionOrMining,
    );

    noticeOfIntentSubmission.soilIsAreaWideFilling = filterUndefined(
      updateDto.soilIsAreaWideFilling,
      noticeOfIntentSubmission.soilIsAreaWideFilling,
    );

    noticeOfIntentSubmission.soilHasSubmittedNotice = filterUndefined(
      updateDto.soilHasSubmittedNotice,
      noticeOfIntentSubmission.soilHasSubmittedNotice,
    );

    noticeOfIntentSubmission.soilIsRemovingSoilForNewStructure =
      filterUndefined(
        updateDto.soilIsRemovingSoilForNewStructure,
        noticeOfIntentSubmission.soilIsRemovingSoilForNewStructure,
      );

    noticeOfIntentSubmission.soilStructureFarmUseReason = filterUndefined(
      updateDto.soilStructureFarmUseReason,
      noticeOfIntentSubmission.soilStructureFarmUseReason,
    );

    noticeOfIntentSubmission.soilStructureResidentialUseReason =
      filterUndefined(
        updateDto.soilStructureResidentialUseReason,
        noticeOfIntentSubmission.soilStructureResidentialUseReason,
      );

    noticeOfIntentSubmission.soilAgriParcelActivity = filterUndefined(
      updateDto.soilAgriParcelActivity,
      noticeOfIntentSubmission.soilAgriParcelActivity,
    );

    noticeOfIntentSubmission.soilStructureResidentialAccessoryUseReason =
      filterUndefined(
        updateDto.soilStructureResidentialAccessoryUseReason,
        noticeOfIntentSubmission.soilStructureResidentialAccessoryUseReason,
      );

    noticeOfIntentSubmission.soilStructureOtherUseReason = filterUndefined(
      updateDto.soilStructureOtherUseReason,
      noticeOfIntentSubmission.soilStructureOtherUseReason,
    );

    noticeOfIntentSubmission.soilProposedStructures = filterUndefined(
      updateDto.soilProposedStructures,
      noticeOfIntentSubmission.soilProposedStructures,
    );

    if (
      updateDto.soilHasSubmittedNotice === false ||
      updateDto.soilIsExtractionOrMining === false
    ) {
      const noiUuid = await this.noticeOfIntentService.getUuid(
        noticeOfIntentSubmission.fileNumber,
      );
      await this.noticeOfIntentDocumentService.deleteByType(
        DOCUMENT_TYPE.NOTICE_OF_WORK,
        noiUuid,
      );
    }
  }

  async canDeleteDocument(document: NoticeOfIntentDocument, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return true;
    }

    const documentFlags = await this.getDocumentFlags(document);

    const isOwner = user.uuid === documentFlags.ownerUuid;
    const isGovernmentOnFile =
      user.bceidBusinessGuid === documentFlags.localGovernmentGuid;
    const isSameAccountAsOwner =
      !!user.bceidBusinessGuid &&
      user.bceidBusinessGuid === documentFlags.ownerGuid;

    return isOwner || isGovernmentOnFile || isSameAccountAsOwner;
  }

  async canAccessDocument(document: NoticeOfIntentDocument, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles.includes(value),
    );

    //If user is ALCS staff
    if (overlappingRoles.length > 0) {
      return true;
    }

    //If document has P, skip all checks.
    if (document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      return true;
    }

    const documentFlags = await this.getDocumentFlags(document);

    const applicantFlag =
      document.visibilityFlags.includes(VISIBILITY_FLAG.APPLICANT) &&
      user.uuid === documentFlags.ownerUuid;
    const governmentFlag =
      !!user.bceidBusinessGuid &&
      document.visibilityFlags.includes(VISIBILITY_FLAG.GOVERNMENT) &&
      user.bceidBusinessGuid === documentFlags.localGovernmentGuid;
    const sharedAccountFlag =
      !!user.bceidBusinessGuid &&
      document.visibilityFlags.includes(VISIBILITY_FLAG.APPLICANT) &&
      user.bceidBusinessGuid === documentFlags.ownerGuid;

    return applicantFlag || governmentFlag || sharedAccountFlag;
  }

  private async getDocumentFlags(document: NoticeOfIntentDocument) {
    const result = await this.noticeOfIntentSubmissionRepository
      .createQueryBuilder('submission')
      .leftJoin('submission.noticeOfIntent', 'noticeOfIntent')
      .leftJoin('noticeOfIntent.documents', 'document')
      .leftJoin('submission.createdBy', 'user')
      .leftJoin('noticeOfIntent.localGovernment', 'localGovernment')
      .select([
        'user.uuid',
        'user.bceid_business_guid',
        'localGovernment.bceidBusinessGuid',
      ])
      .where('document.uuid = :uuid', {
        uuid: document.uuid,
      })
      .andWhere('submission.is_draft = FALSE')
      .execute();

    return {
      ownerUuid: result[0]?.user_uuid,
      ownerGuid: result[0]?.bceid_business_guid,
      localGovernmentGuid: result[0]?.localGovernment_bceid_business_guid,
    };
  }
}
