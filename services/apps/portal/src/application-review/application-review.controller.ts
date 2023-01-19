import { BaseServiceException } from '@app/common/exceptions/base.exception';
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
  ) {}

  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);

    const applicationReview = await this.applicationReviewService.get(
      fileNumber,
      userLocalGovernment,
    );

    return this.applicationReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
  }

  @Post('/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() updateDto: UpdateApplicationReviewDto,
  ) {
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);

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
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);

    const application = await this.applicationService.getForGovernmentByFileId(
      fileNumber,
      userLocalGovernment,
    );

    const applicationReview = await this.applicationReviewService.startReview(
      application,
    );

    await this.applicationService.updateStatus(
      fileNumber,
      APPLICATION_STATUS.IN_REVIEW,
    );

    return this.applicationReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
  }

  @Post('/:fileNumber/finish')
  async finish(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);

    const application = await this.applicationService.getForGovernmentByFileId(
      fileNumber,
      userLocalGovernment,
    );

    const applicationReview = await this.applicationReviewService.get(
      application.fileNumber,
      userLocalGovernment,
    );

    const completedApplication = this.applicationReviewService.verifyComplete(
      application,
      applicationReview,
      userLocalGovernment.isFirstNation,
    );

    if (application.statusCode === APPLICATION_STATUS.IN_REVIEW) {
      if (completedApplication.isAuthorized !== false) {
        await this.applicationService.submitToAlcs(
          fileNumber,
          {
            applicant: application.applicant!,
            localGovernmentUuid: application.localGovernmentUuid!,
          },
          completedApplication,
        );
      } else {
        await this.applicationService.updateStatus(
          fileNumber,
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
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);

    const application = await this.applicationService.getForGovernmentByFileId(
      fileNumber,
      userLocalGovernment,
    );

    const applicationReview = await this.applicationReviewService.get(
      application.fileNumber,
      userLocalGovernment,
    );

    if (application.statusCode === APPLICATION_STATUS.IN_REVIEW) {
      await this.applicationService.update(application.fileNumber, {
        returnedComment: returnDto.applicantComment,
      });

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

      if (returnDto.reasonForReturn === 'incomplete') {
        await this.applicationService.updateStatus(
          fileNumber,
          APPLICATION_STATUS.INCOMPLETE,
        );
      } else {
        await this.applicationService.updateStatus(
          fileNumber,
          APPLICATION_STATUS.WRONG_GOV,
        );
      }
    } else {
      throw new BaseServiceException('Application not in correct status');
    }
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
    throw new NotFoundException('User not part of any local government');
  }
}
