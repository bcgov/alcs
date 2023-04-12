import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { User } from '../../../user/user.entity';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';

@Controller('generate-submission-document')
@UseGuards(PortalAuthGuard)
export class GenerateSubmissionDocumentController {
  constructor(
    private generateSubmissionDocumentService: GenerateSubmissionDocumentService,
  ) {}

  @Get(':fileNumber')
  async generateDocument(
    @Res() resp: FastifyReply,
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ) {
    const user = req.user.entity as User;
    const result = await this.generateSubmissionDocumentService.generate(
      fileNumber,
      user,
    );

    resp.type('application/pdf');
    resp.send(result.data);
  }
}
