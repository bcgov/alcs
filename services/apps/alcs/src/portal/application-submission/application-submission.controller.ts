import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServiceValidationException } from '../../../../../libs/common/src/exceptions/base.exception';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionValidatorService } from './application-submission-validator.service';
import {
  ApplicationSubmissionCreateDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';
import { ApplicationSubmissionService } from './application-submission.service';

@Controller('application-submission')
@UseGuards(PortalAuthGuard)
export class ApplicationSubmissionController {
  private logger: Logger = new Logger(ApplicationSubmissionController.name);

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private localGovernmentService: LocalGovernmentService,
    private applicationSubmissionValidatorService: ApplicationSubmissionValidatorService,
  ) {}

  @Get()
  async getApplications(@Req() req) {
    const user = req.user.entity as User;

    if (user.bceidBusinessGuid) {
      const localGovernments = await this.localGovernmentService.list();
      const matchingGovernment = localGovernments.find(
        (lg) => lg.bceidBusinessGuid === user.bceidBusinessGuid,
      );
      if (matchingGovernment) {
        const applications =
          await this.applicationSubmissionService.getForGovernment(
            matchingGovernment,
          );

        return this.applicationSubmissionService.mapToDTOs(
          [...applications],
          user,
          matchingGovernment,
        );
      }
    }

    const applications = await this.applicationSubmissionService.getByUser(
      user,
    );
    return this.applicationSubmissionService.mapToDTOs(applications, user);
  }

  @Get('/application/:fileId')
  async getSubmissionByFileId(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;

    const submission =
      await this.applicationSubmissionService.verifyAccessByFileId(
        fileId,
        user,
      );

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (
        localGovernment &&
        submission.localGovernmentUuid === localGovernment.uuid
      ) {
        return await this.applicationSubmissionService.mapToDetailedDTO(
          submission,
          localGovernment,
        );
      }
    }

    return await this.applicationSubmissionService.mapToDetailedDTO(submission);
  }

  @Get('/:uuid')
  async getSubmission(@Req() req, @Param('uuid') uuid: string) {
    const user = req.user.entity as User;

    const submission =
      await this.applicationSubmissionService.verifyAccessByUuid(uuid, user);

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (
        localGovernment &&
        localGovernment.uuid === submission.localGovernmentUuid
      ) {
        return await this.applicationSubmissionService.mapToDetailedDTO(
          submission,
          localGovernment,
        );
      }
    }

    return await this.applicationSubmissionService.mapToDetailedDTO(submission);
  }

  @Post()
  async create(@Req() req, @Body() body: ApplicationSubmissionCreateDto) {
    const { type, prescribedBody } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.applicationSubmissionService.create(
      type,
      user,
      prescribedBody,
    );
    return {
      fileId: newFileNumber,
    };
  }

  @Put('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationSubmissionUpdateDto,
    @Req() req,
  ) {
    const submission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    if (
      !submission.status ||
      ![
        SUBMISSION_STATUS.INCOMPLETE.toString(),
        SUBMISSION_STATUS.WRONG_GOV.toString(),
        SUBMISSION_STATUS.IN_PROGRESS.toString(),
      ].includes(submission.status.statusTypeCode)
    ) {
      throw new ServiceValidationException('Not allowed to update submission');
    }

    const updatedSubmission = await this.applicationSubmissionService.update(
      submission.uuid,
      updateDto,
    );

    return await this.applicationSubmissionService.mapToDetailedDTO(
      updatedSubmission,
      req.user.entity,
    );
  }

  @Post('/:uuid/cancel')
  async cancel(@Param('uuid') uuid: string, @Req() req) {
    const user = req.user.entity;

    const application =
      await this.applicationSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );
    let localGovernment: LocalGovernment | null = null;

    if (user.bceidBusinessGuid) {
      localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
    }

    if (
      localGovernment === null &&
      application.status.statusTypeCode !== SUBMISSION_STATUS.IN_PROGRESS
    ) {
      throw new BadRequestException('Can only cancel in progress Applications');
    }

    await this.applicationSubmissionService.cancel(application);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:uuid')
  async submitAsApplicant(@Param('uuid') uuid: string, @Req() req) {
    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    const validationResult =
      await this.applicationSubmissionValidatorService.validateSubmission(
        applicationSubmission,
      );

    if (validationResult.application) {
      const validatedApplicationSubmission = validationResult.application;
      if (validatedApplicationSubmission.typeCode === 'TURP') {
        await this.applicationSubmissionService.submitToAlcs(
          validatedApplicationSubmission,
          req.user.entity,
        );
        return await this.applicationSubmissionService.updateStatus(
          applicationSubmission,
          SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        );
      } else {
        return await this.applicationSubmissionService.submitToLg(
          validatedApplicationSubmission,
        );
      }
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Application');
    }
  }
}
