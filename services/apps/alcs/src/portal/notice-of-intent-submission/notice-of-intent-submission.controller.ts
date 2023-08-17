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
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { NoticeOfIntentSubmissionValidatorService } from './notice-of-intent-submission-validator.service';
import {
  NoticeOfIntentSubmissionCreateDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

@Controller('notice-of-intent-submission')
@UseGuards(PortalAuthGuard)
export class NoticeOfIntentSubmissionController {
  private logger: Logger = new Logger(NoticeOfIntentSubmissionController.name);

  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentValidatorService: NoticeOfIntentSubmissionValidatorService,
  ) {}

  @Get()
  async getSubmissions(@Req() req) {
    const user = req.user.entity as User;

    if (user.bceidBusinessGuid) {
      //TODO: Business accounts?
    }

    const applications = await this.noticeOfIntentSubmissionService.getByUser(
      user,
    );
    return this.noticeOfIntentSubmissionService.mapToDTOs(applications);
  }

  @Get('/application/:fileId')
  async getSubmissionByFileId(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;

    const submission =
      await this.noticeOfIntentSubmissionService.verifyAccessByFileId(
        fileId,
        user,
      );

    return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
      submission,
    );
  }

  @Get('/:uuid')
  async getSubmission(@Req() req, @Param('uuid') uuid: string) {
    const user = req.user.entity as User;

    const submission =
      await this.noticeOfIntentSubmissionService.verifyAccessByUuid(uuid, user);

    return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
      submission,
    );
  }

  @Post()
  async create(@Req() req, @Body() body: NoticeOfIntentSubmissionCreateDto) {
    const { type } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.noticeOfIntentSubmissionService.create(
      type,
      user,
    );
    return {
      fileId: newFileNumber,
    };
  }

  @Put('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: NoticeOfIntentSubmissionUpdateDto,
    @Req() req,
  ) {
    const submission =
      await this.noticeOfIntentSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    const updatedSubmission = await this.noticeOfIntentSubmissionService.update(
      submission.uuid,
      updateDto,
    );

    return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
      updatedSubmission,
    );
  }

  @Post('/:uuid/cancel')
  async cancel(@Param('uuid') uuid: string, @Req() req) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    await this.noticeOfIntentSubmissionService.cancel(noticeOfIntentSubmission);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:uuid')
  async submitAsApplicant(@Param('uuid') uuid: string, @Req() req) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    const validationResult =
      await this.noticeOfIntentValidatorService.validateSubmission(
        noticeOfIntentSubmission,
      );

    if (validationResult.noticeOfIntentSubmission) {
      const validatedApplicationSubmission =
        validationResult.noticeOfIntentSubmission;

      await this.noticeOfIntentSubmissionService.submitToAlcs(
        validatedApplicationSubmission,
      );

      const finalSubmission =
        await this.noticeOfIntentSubmissionService.verifyAccessByUuid(
          uuid,
          req.user.entity,
        );
      return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
        finalSubmission,
      );
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Notice of Intent');
    }
  }
}
