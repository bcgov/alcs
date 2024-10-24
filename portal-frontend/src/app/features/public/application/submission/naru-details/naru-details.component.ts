import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { openFileInline } from '../../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';

@Component({
  selector: 'app-naru-details[applicationSubmission]',
  templateUrl: './naru-details.component.html',
  styleUrls: ['./naru-details.component.scss'],
})
export class NaruDetailsComponent {
  proposalMap: PublicDocumentDto[] = [];
  buildingPlans: PublicDocumentDto[] = [];

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  @Input() applicationSubmission!: PublicApplicationSubmissionDto;
  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  constructor(
    private router: Router,
    private publicService: PublicService,
  ) {}

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getApplicationOpenFileUrl(this.applicationSubmission.fileNumber, file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
