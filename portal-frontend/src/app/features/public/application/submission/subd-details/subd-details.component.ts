import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicApplicationSubmissionDto, PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';

@Component({
  selector: 'app-subd-details[applicationSubmission]',
  templateUrl: './subd-details.component.html',
  styleUrls: ['./subd-details.component.scss'],
})
export class SubdDetailsComponent {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;

  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  proposalMap: PublicDocumentDto[] = [];

  constructor(private router: Router, private publicService: PublicService) {}

  async openFile(uuid: string) {
    const res = await this.publicService.getApplicationFileUrl(this.applicationSubmission.fileNumber, uuid);
    if (res) {
      window.open(res?.url, '_blank');
    }
  }
}
