import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { GenerateReviewDocumentService } from './generate-review-document.service';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';

@Controller('pdf-generation')
@UseGuards(PortalAuthGuard)
export class PdfGenerationController {
  constructor(
    private submissionDocumentService: GenerateSubmissionDocumentService,
    private reviewDocumentService: GenerateReviewDocumentService,
  ) {}

  @Get(':fileNumber/submission')
  async generateSubmission(
    @Res() resp: FastifyReply,
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ) {
    const user = req.user.entity as User;
    const result = await this.submissionDocumentService.generate(
      fileNumber,
      user,
    );

    if (result) {
      resp.type('application/pdf');
      resp.send(result.data);
    }
  }

  @Get(':fileNumber/review')
  async generateReview(
    @Res() resp: FastifyReply,
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ) {
    const user = req.user.entity as User;
    const result = await this.reviewDocumentService.generate(fileNumber, user);

    resp.type('application/pdf');
    resp.send(result.data);
  }
}
