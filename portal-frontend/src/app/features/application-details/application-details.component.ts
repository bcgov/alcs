import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationOwnerDetailedDto } from '../../services/application-owner/application-owner.dto';
import { PARCEL_TYPE } from '../../services/application-parcel/application-parcel.dto';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { LocalGovernmentDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Input() isValidate: boolean = true;
  isParcelDetailsValid = false;
  parcelType = PARCEL_TYPE;
  application: ApplicationDetailedDto | undefined;
  primaryContact: ApplicationOwnerDetailedDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT.PHOTOGRAPH, DOCUMENT.PROFESSIONAL_REPORT, DOCUMENT.OTHER];

  parcelValidation(isParcelDetailsValid: boolean) {
    this.isParcelDetailsValid = isParcelDetailsValid;
  }

  constructor(
    private codeService: CodeService,
    private applicationDocumentService: ApplicationDocumentService,
    private router: Router,
    private toastService: ToastService,
    private applicationService: ApplicationService
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
      }
    });
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  onNavigateToStep(step: number) {
    this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}`);
  }

  async onSubmitToAlcs() {
    if (!this.application?.localGovernmentUuid) {
      this.toastService.showErrorToast('Please set local government first.');
      return;
    }

    const el = document.getElementsByClassName('error');
    if (el && el.length > 0) {
      el[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      this.toastService.showErrorToast('Please correct all errors before submitting the form');
    } else if (this.application) {
      await this.applicationService.submitToAlcs(this.application.fileNumber);
      await this.router.navigateByUrl(`/application/${this.application?.fileNumber}`);
    }
  }

  async onSaveExit() {
    await this.router.navigateByUrl(`/application/${this.application?.fileNumber}`);
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
