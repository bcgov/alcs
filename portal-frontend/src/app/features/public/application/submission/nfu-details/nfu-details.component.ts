import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { openFileWindow } from '../../../../../shared/utils/file';

@Component({
  selector: 'app-nfu-details[applicationSubmission]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;

  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  proposalMap: PublicDocumentDto[] = [];

  constructor(private router: Router, private publicService: PublicService) {}

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getApplicationOpenFileUrl(this.applicationSubmission.fileNumber, file.uuid);
    if (res) {
      openFileWindow(res.url, file.fileName);
    }
  }
}
