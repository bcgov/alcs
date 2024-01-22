import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalGovernmentDto } from '../../../../services/code/code.dto';
import { CodeService } from '../../../../services/code/code.service';
import { PublicNotificationSubmissionDto } from '../../../../services/public/public-notification.dto';
import { PublicDocumentDto, PublicOwnerDto, PublicParcelDto } from '../../../../services/public/public.dto';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';

@Component({
  selector: 'app-public-app-submission-details',
  templateUrl: './submission-details.component.html',
  styleUrls: ['./submission-details.component.scss'],
})
export class SubmissionDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() submission!: PublicNotificationSubmissionDto;
  @Input() documents: PublicDocumentDto[] = [];
  @Input() parcels: PublicParcelDto[] = [];

  primaryContact: PublicOwnerDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  OWNER_TYPE = OWNER_TYPE;

  private localGovernments: LocalGovernmentDto[] = [];

  constructor(private codeService: CodeService) {}

  ngOnInit(): void {
    this.loadGovernments();
    if (this.submission) {
      this.populateLocalGovernment(this.submission.localGovernmentUuid);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.submission?.localGovernmentUuid) {
      this.populateLocalGovernment(this.submission?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }
}
