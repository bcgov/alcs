import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { APPLICATION_OWNER, ApplicationOwnerDetailedDto } from '../../services/application-owner/application-owner.dto';
import { PARCEL_TYPE } from '../../services/application-parcel/application-parcel.dto';
import { ApplicationProposalDetailedDto } from '../../services/application/application-proposal.dto';
import { LocalGovernmentDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationProposalDetailedDto | undefined>;
  @Input() showErrors: boolean = true;
  @Input() showEdit: boolean = true;
  parcelType = PARCEL_TYPE;
  application: ApplicationProposalDetailedDto | undefined;
  primaryContact: ApplicationOwnerDetailedDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  needsAuthorizationLetter = true;

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT.PHOTOGRAPH, DOCUMENT.PROFESSIONAL_REPORT, DOCUMENT.OTHER];

  constructor(
    private codeService: CodeService,
    private applicationDocumentService: ApplicationDocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGovernments();
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((app) => {
      this.application = app;
      if (app) {
        this.primaryContact = app.owners.find((owner) => owner.uuid === app.primaryContactOwnerUuid);
        this.populateLocalGovernment(app.localGovernmentUuid);

        this.otherFiles = app.documents
          .filter((file) => (file.type ? this.otherFileTypes.includes(file.type) : true))
          .sort((a, b) => {
            return a.uploadedAt - b.uploadedAt;
          });

        this.authorizationLetters = app.documents
          .filter((file) => file.type === DOCUMENT.AUTHORIZATION_LETTER)
          .sort((a, b) => {
            return a.uploadedAt - b.uploadedAt;
          });

        const hasSelectedAgent = this.primaryContact?.type.code == APPLICATION_OWNER.AGENT;
        const nonAgentOwners = app.owners.filter((owner) => owner.type.code !== APPLICATION_OWNER.AGENT);
        const crownOwners = app.owners.filter((owner) => owner.type.code === APPLICATION_OWNER.CROWN);

        this.needsAuthorizationLetter = nonAgentOwners.length > 1 || hasSelectedAgent || crownOwners.length > 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  onNavigateToStep(step: number) {
    this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}?errors=t`);
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.application?.localGovernmentUuid) {
      this.populateLocalGovernment(this.application?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }
}
