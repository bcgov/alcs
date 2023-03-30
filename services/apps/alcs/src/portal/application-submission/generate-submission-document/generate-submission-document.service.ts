import { Injectable } from '@nestjs/common';
import * as config from 'config';
import { CdogsService } from '../../../../../../libs/common/src/cdogs/cdogs.service';
import { User } from '../../../user/user.entity';
import { ApplicationSubmissionService } from '../application-submission.service';

@Injectable()
export class GenerateSubmissionDocumentService {
  constructor(
    private documentGenerationService: CdogsService,
    private applicationSubmissionService: ApplicationSubmissionService,
  ) {}

  async generate(fileNumber: string, user: User) {
    console.log('generate', fileNumber);

    const submission = await this.applicationSubmissionService.verifyAccess(
      fileNumber,
      user,
    );

    console.log('submission', submission);

    // TODO this should use templates based on the application type
    const pdf = await this.documentGenerationService.generateDocument(
      `${fileNumber}_submission_Date_Time`,
      `${config.get<string>(
        'CDOGS.TEMPLATE_FOLDER',
      )}/nfu-submission-template.docx`,
      {},
    );

    return pdf;
  }
}
