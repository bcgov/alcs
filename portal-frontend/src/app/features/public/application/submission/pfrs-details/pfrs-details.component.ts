import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { PublicApplicationComponent } from '../../public-application.component';

@Component({
  selector: 'app-pfrs-details[applicationSubmission]',
  templateUrl: './pfrs-details.component.html',
  styleUrls: ['./pfrs-details.component.scss'],
})
export class PfrsDetailsComponent {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  crossSections: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(private router: Router, private publicService: PublicService) {}

  async openFile(uuid: string) {
    const res = await this.publicService.getApplicationFileUrl(this.applicationSubmission.fileNumber, uuid);
    if (res) {
      window.open(res?.url, '_blank');
    }
  }
}
