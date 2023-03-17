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
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { User } from '../user/user.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationSubmissionValidatorService } from './application-submission-validator.service';
import {
  ApplicationSubmissionCreateDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';
import { ApplicationSubmissionService } from './application-submission.service';

@Controller('application')
@UseGuards(AuthGuard)
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
      const localGovernments = await this.localGovernmentService.get();
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

  @Get('/:fileId')
  async getApplication(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (localGovernment) {
        const application =
          await this.applicationSubmissionService.getForGovernmentByFileId(
            fileId,
            localGovernment,
          );
        return await this.applicationSubmissionService.mapToDetailedDTO(
          application,
          localGovernment,
        );
      }
    }

    const application = await this.applicationSubmissionService.getIfCreator(
      fileId,
      user,
    );

    return await this.applicationSubmissionService.mapToDetailedDTO(
      application,
    );
  }

  @Post()
  async create(@Req() req, @Body() body: ApplicationSubmissionCreateDto) {
    const { type } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.applicationSubmissionService.create(
      type,
      user,
    );
    return {
      fileId: newFileNumber,
    };
  }

  @Put('/:fileId')
  async update(
    @Param('fileId') fileId: string,
    @Body() updateDto: ApplicationSubmissionUpdateDto,
    @Req() req,
  ) {
    await this.applicationSubmissionService.verifyAccess(
      fileId,
      req.user.entity,
    );

    const application = await this.applicationSubmissionService.update(
      fileId,
      updateDto,
    );

    const mappedApps = await this.applicationSubmissionService.mapToDetailedDTO(
      application,
      req.user.entity,
    );
    return mappedApps[0];
  }

  @Post('/:fileId/cancel')
  async cancel(@Param('fileId') fileId: string, @Req() req) {
    const application = await this.applicationSubmissionService.getIfCreator(
      fileId,
      req.user.entity,
    );

    if (application.status.code !== APPLICATION_STATUS.IN_PROGRESS) {
      throw new BadRequestException('Can only cancel in progress Applications');
    }

    await this.applicationSubmissionService.cancel(application);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:fileId')
  async submitAsApplicant(@Param('fileId') fileId: string, @Req() req) {
    const application = await this.applicationSubmissionService.getIfCreator(
      fileId,
      req.user.entity,
    );

    const validationResult =
      await this.applicationSubmissionValidatorService.validateApplication(
        application,
      );

    if (validationResult.application) {
      const validApplication = validationResult.application;
      if (validApplication.typeCode === 'TURP') {
        await this.applicationSubmissionService.submitToAlcs(validApplication);
        return await this.applicationSubmissionService.updateStatus(
          application,
          APPLICATION_STATUS.SUBMITTED_TO_ALC,
        );
      } else {
        return await this.applicationSubmissionService.submitToLg(
          validApplication,
        );
      }
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Application');
    }
  }
}
