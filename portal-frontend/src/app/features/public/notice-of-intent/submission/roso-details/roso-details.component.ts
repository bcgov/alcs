import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';

@Component({
  selector: 'app-roso-details[noiSubmission]',
  templateUrl: './roso-details.component.html',
  styleUrls: ['./roso-details.component.scss'],
})
export class RosoDetailsComponent {
  @Input() noiSubmission!: PublicNoticeOfIntentSubmissionDto;

  @Input() set noiDocuments(documents: PublicDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  crossSections: PublicDocumentDto[] = [];
  proposalMap: PublicDocumentDto[] = [];

  constructor(private router: Router, private publicService: PublicService) {}

  async openFile(uuid: string) {
    const res = await this.publicService.getNoticeOfIntentOpenFileUrl(this.noiSubmission.fileNumber, uuid);
    window.open(res?.url, '_blank');
  }
}
