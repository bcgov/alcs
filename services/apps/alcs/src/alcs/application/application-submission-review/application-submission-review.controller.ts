import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-submission-review')
export class ApplicationSubmissionReviewController {
  constructor(
    private applicationSubmissionReviewService: ApplicationSubmissionReviewService, // private documentService: DocumentService,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string) {
    const submission = await this.applicationSubmissionReviewService.get(
      fileNumber,
    );

    return await this.applicationSubmissionReviewService.mapToDto(submission);
  }
}
