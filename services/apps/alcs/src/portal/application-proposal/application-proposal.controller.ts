import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
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
import { ApplicationProposalValidatorService } from './application-proposal-validator.service';
import {
  ApplicationProposalCreateDto,
  ApplicationProposalUpdateDto,
} from './application-proposal.dto';
import { ApplicationProposalService } from './application-proposal.service';
import { APPLICATION_STATUS } from './application-status/application-status.dto';

@Controller('application')
@UseGuards(AuthGuard)
export class ApplicationProposalController {
  private logger: Logger = new Logger(ApplicationProposalController.name);

  constructor(
    private applicationProposalService: ApplicationProposalService,
    private localGovernmentService: LocalGovernmentService,
    private applicationProposalValidatorService: ApplicationProposalValidatorService,
    @InjectMapper() private mapper: Mapper,
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
          await this.applicationProposalService.getForGovernment(
            matchingGovernment,
          );

        return this.applicationProposalService.mapToDTOs(
          [...applications],
          user,
          matchingGovernment,
        );
      }
    }

    const applications = await this.applicationProposalService.getByUser(user);
    return this.applicationProposalService.mapToDTOs(applications, user);
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
          await this.applicationProposalService.getForGovernmentByFileId(
            fileId,
            localGovernment,
          );
        return await this.applicationProposalService.mapToDetailedDTO(
          application,
          localGovernment,
        );
      }
    }

    const application = await this.applicationProposalService.getIfCreator(
      fileId,
      user,
    );

    return await this.applicationProposalService.mapToDetailedDTO(application);
  }

  @Post()
  async create(@Req() req, @Body() body: ApplicationProposalCreateDto) {
    const { type } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.applicationProposalService.create(
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
    @Body() updateDto: ApplicationProposalUpdateDto,
    @Req() req,
  ) {
    await this.applicationProposalService.verifyAccess(fileId, req.user.entity);

    const application = await this.applicationProposalService.update(
      fileId,
      updateDto,
    );

    const mappedApps = await this.applicationProposalService.mapToDetailedDTO(
      application,
      req.user.entity,
    );
    return mappedApps[0];
  }

  @Post('/:fileId/cancel')
  async cancel(@Param('fileId') fileId: string, @Req() req) {
    const application = await this.applicationProposalService.getIfCreator(
      fileId,
      req.user.entity,
    );

    if (application.status.code !== APPLICATION_STATUS.IN_PROGRESS) {
      throw new BadRequestException('Can only cancel in progress Applications');
    }

    await this.applicationProposalService.cancel(application);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:fileId')
  async submitAsApplicant(@Param('fileId') fileId: string, @Req() req) {
    const application = await this.applicationProposalService.getIfCreator(
      fileId,
      req.user.entity,
    );

    const validationResult =
      await this.applicationProposalValidatorService.validateApplication(
        application,
      );

    if (validationResult.application) {
      const validApplication = validationResult.application;
      if (validApplication.typeCode === 'TURP') {
        await this.applicationProposalService.submitToAlcs(validApplication);
        return await this.applicationProposalService.updateStatus(
          application,
          APPLICATION_STATUS.SUBMITTED_TO_ALC,
        );
      } else {
        return await this.applicationProposalService.submitToLg(
          validApplication,
        );
      }
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Application');
    }
  }
}
