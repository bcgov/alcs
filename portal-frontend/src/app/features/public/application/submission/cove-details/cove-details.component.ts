import { Component, Input } from '@angular/core';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto, PublicOwnerDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { openFileInline } from '../../../../../shared/utils/file';

@Component({
  selector: 'app-cove-details',
  templateUrl: './cove-details.component.html',
  styleUrls: ['./cove-details.component.scss'],
})
export class CoveDetailsComponent {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;
  @Input() transferees!: PublicOwnerDto[];

  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  proposalMap: PublicDocumentDto[] = [];

  constructor(private publicService: PublicService) {}

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getApplicationOpenFileUrl(this.applicationSubmission.fileNumber, file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }
}
