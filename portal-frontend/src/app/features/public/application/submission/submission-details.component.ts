import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PARCEL_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { LocalGovernmentDto } from '../../../../services/code/code.dto';
import { CodeService } from '../../../../services/code/code.service';
import { PublicApplicationSubmissionDto } from '../../../../services/public/public-application.dto';
import { PublicDocumentDto, PublicOwnerDto, PublicParcelDto } from '../../../../services/public/public.dto';
import { PublicService } from '../../../../services/public/public.service';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';

@Component({
  selector: 'app-public-app-submission-details',
  templateUrl: './submission-details.component.html',
  styleUrls: ['./submission-details.component.scss'],
})
export class SubmissionDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() applicationSubmission!: PublicApplicationSubmissionDto;
  @Input() applicationDocuments: PublicDocumentDto[] = [];
  @Input() applicationParcels: PublicParcelDto[] = [];

  parcelType = PARCEL_TYPE;
  primaryContact: PublicOwnerDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  OWNER_TYPE = OWNER_TYPE;

  private localGovernments: LocalGovernmentDto[] = [];

  constructor(private codeService: CodeService) {}

  ngOnInit(): void {
    this.loadGovernments();
    if (this.applicationSubmission) {
      this.primaryContact = this.applicationSubmission.owners.find(
        (owner) => owner.uuid === this.applicationSubmission.primaryContactOwnerUuid
      );
      this.populateLocalGovernment(this.applicationSubmission.localGovernmentUuid);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.applicationSubmission?.localGovernmentUuid) {
      this.populateLocalGovernment(this.applicationSubmission?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }
}
