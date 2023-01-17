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
import { APPLICATION_STATUS } from '../application/application-status/application-status.dto';
import { ApplicationService } from '../application/application.service';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { User } from '../user/user.entity';
import { UpdateApplicationReviewDto } from './application-review.dto';
import { ApplicationReviewService } from './application-review.service';

@Controller('application-review')
@UseGuards(AuthGuard)
export class ApplicationReviewController {
  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
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
      if (completedApplication.isAuthorized) {
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
