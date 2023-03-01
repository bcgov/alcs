import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { DOCUMENT_TYPE } from '../application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../application/application-document/application-document.service';
import { APPLICATION_STATUS } from '../application/application-status/application-status.dto';
import { ApplicationValidatorService } from '../application/application-validator.service';
import { ApplicationService } from '../application/application.service';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { User } from '../user/user.entity';
import {
  ReturnApplicationDto,
  UpdateApplicationReviewDto,
} from './application-review.dto';
import { ApplicationReviewService } from './application-review.service';

@Controller('application-review')
@UseGuards(AuthGuard)
export class ApplicationReviewController {
  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private applicationDocumentService: ApplicationDocumentService,
    private localGovernmentService: LocalGovernmentService,
    private applicationValidatorService: ApplicationValidatorService,
  ) {}

  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);
    if (userLocalGovernment) {
      const applicationReview =
        await this.applicationReviewService.getForGovernment(
          fileNumber,
          userLocalGovernment,
        );

      if (applicationReview) {
        return this.applicationReviewService.mapToDto(
          applicationReview,
          userLocalGovernment,
        );
      }
    }

    const applicationReview = await this.applicationReviewService.getForOwner(
      fileNumber,
      req.user.entity,
    );

    if (
      ![
        APPLICATION_STATUS.SUBMITTED_TO_ALC,
        APPLICATION_STATUS.REFUSED_TO_FORWARD,
      ].includes(applicationReview.application.statusCode as APPLICATION_STATUS)
    ) {
      throw new NotFoundException('Failed to load review');
    }

    const localGovernments = await this.localGovernmentService.get();
    const matchingGovernment = localGovernments.find(
      (lg) => lg.uuid === applicationReview.application.localGovernmentUuid,
    );
    if (!matchingGovernment) {
      throw new BaseServiceException('Failed to load Local Government');
    }

    return this.applicationReviewService.mapToDto(
      applicationReview,
      matchingGovernment,
    );
  }

  @Post('/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() updateDto: UpdateApplicationReviewDto,
  ) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const applicationReview = await this.applicationReviewService.update(
      fileNumber,
      userLocalGovernment,
      updateDto,
    );

    return this.applicationReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
  }

  @Post('/:fileNumber/start')
  async create(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const application = await this.applicationService.getForGovernmentByFileId(
      fileNumber,
      userLocalGovernment,
    );

    const applicationReview = await this.applicationReviewService.startReview(
      application,
    );

    await this.applicationService.updateStatus(
      application,
      APPLICATION_STATUS.IN_REVIEW,
    );

    return this.applicationReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
  }

  @Post('/:fileNumber/finish')
  async finish(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const application = await this.applicationService.getForGovernmentByFileId(
      fileNumber,
      userLocalGovernment,
    );

    const applicationReview =
      await this.applicationReviewService.getForGovernment(
        application.fileNumber,
        userLocalGovernment,
      );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load applicaiton review');
    }

    const completedReview = this.applicationReviewService.verifyComplete(
      application,
      applicationReview,
      userLocalGovernment.isFirstNation,
    );

    const validationResult =
      await this.applicationValidatorService.validateApplication(application);

    if (!validationResult.application) {
      throw new BaseServiceException(
        `Invalid application found during LG Submission ${application.fileNumber}`,
      );
    }

    if (application.statusCode === APPLICATION_STATUS.IN_REVIEW) {
      if (completedReview.isAuthorized !== false) {
        await this.applicationService.submitToAlcs(
          validationResult.application,
          completedReview,
        );
      } else {
        await this.applicationService.updateStatus(
          application,
          APPLICATION_STATUS.REFUSED_TO_FORWARD,
        );
      }
    } else {
      throw new BaseServiceException('Application not in correct status');
    }
  }

  @Post('/:fileNumber/return')
  async return(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() returnDto: ReturnApplicationDto,
  ) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const application = await this.applicationService.getForGovernmentByFileId(
      fileNumber,
      userLocalGovernment,
    );

    const applicationReview =
      await this.applicationReviewService.getForGovernment(
        application.fileNumber,
        userLocalGovernment,
      );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load applicaiton review');
    }

    if (application.statusCode === APPLICATION_STATUS.IN_REVIEW) {
      const documentsToDelete = application.documents.filter((document) =>
        [
          DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
          DOCUMENT_TYPE.STAFF_REPORT,
          DOCUMENT_TYPE.REVIEW_OTHER,
        ].includes(document.type as DOCUMENT_TYPE),
      );
      for (const document of documentsToDelete) {
        await this.applicationDocumentService.delete(document);
      }

      await this.applicationReviewService.delete(applicationReview);

      application.returnedComment = returnDto.applicantComment;
      if (returnDto.reasonForReturn === 'incomplete') {
        await this.applicationService.updateStatus(
          application,
          APPLICATION_STATUS.INCOMPLETE,
        );
      } else {
        await this.applicationService.updateStatus(
          application,
          APPLICATION_STATUS.WRONG_GOV,
        );
      }
    } else {
      throw new BaseServiceException('Application not in correct status');
    }
  }

  private async getUserGovernmentOrFail(user: User) {
    const userGovernment = await this.getUserGovernment(user);
    if (!userGovernment) {
      throw new NotFoundException('User not part of any local government');
    }
    return userGovernment;
  }

  private async getUserGovernment(user: User) {
    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (localGovernment) {
        return localGovernment;
      }
    }
    return undefined;
  }
}
