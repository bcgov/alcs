import { AfterViewChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { ApplicationTypeDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';
import { scrollToElement } from '../../../shared/utils/scroll-helper';

export enum ApplicationChangeTypeStepsEnum {
  warning = 0,
  applicationType = 1,
  prescribedBody = 2,
  confirmation = 3,
}

@Component({
  selector: 'app-change-application-type-dialog',
  templateUrl: './change-application-type-dialog.component.html',
  styleUrls: ['./change-application-type-dialog.component.scss'],
})
export class ChangeApplicationTypeDialogComponent implements OnInit, AfterViewChecked {
  submissionUuid: string;
  submissionTypeCode: string;

  applicationTypes: ApplicationTypeDto[] = [];
  selectedAppType: ApplicationTypeDto | undefined = undefined;

  readMoreClicked: boolean = false;
  isReadMoreVisible: boolean = false;

  warningStep = ApplicationChangeTypeStepsEnum.warning;
  applicationTypeStep = ApplicationChangeTypeStepsEnum.applicationType;
  confirmationStep = ApplicationChangeTypeStepsEnum.confirmation;
  prescribedBodyStep = ApplicationChangeTypeStepsEnum.prescribedBody;

  stepIdx = 0;
  prescribedBody: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<ChangeApplicationTypeDialogComponent>,
    private applicationSubmissionService: ApplicationSubmissionService,
    private codeService: CodeService,
    @Inject(MAT_DIALOG_DATA) public data: ChangeApplicationTypeDialogComponent
  ) {
    this.submissionUuid = data.submissionUuid;
    this.submissionTypeCode = data.submissionTypeCode;
  }

  ngAfterViewChecked(): void {
    // timeout is required due to the value change of isReadMoreVisible, otherwise it will error out
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()), 0);
  }

  ngOnInit(): void {
    this.loadCodes();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes
      .filter((type) => !!type.portalLabel)
      .sort((a, b) => (a.portalLabel > b.portalLabel ? 1 : -1));
  }

  async closeDialog(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onSubmit() {
    const result = await this.applicationSubmissionService.updatePending(this.submissionUuid, {
      typeCode: this.selectedAppType!.code,
      prescribedBody: this.prescribedBody,
    });
    if (result) {
      await this.closeDialog(true);
    }
  }

  async onAppTypeSelected(event: MatRadioChange) {
    this.selectedAppType = this.applicationTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;

    setTimeout(() => {
      scrollToElement({ id: 'warningBanner', center: true });
    }, 300);
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    return el ? el.clientHeight < el.scrollHeight : false;
  }

  private checkIfReadMoreVisible(): boolean {
    return this.readMoreClicked || this.isEllipsisActive('appTypeDescription');
  }

  onReadMoreClicked() {
    this.readMoreClicked = !this.readMoreClicked;

    if (this.readMoreClicked) {
      setTimeout(() => {
        scrollToElement({ id: 'warningBanner', center: false });
      }, 300);
    }
  }

  async next() {
    if (this.stepIdx === ApplicationChangeTypeStepsEnum.applicationType) {
      if (this.selectedAppType && ['INCL', 'EXCL'].includes(this.selectedAppType.code)) {
        this.stepIdx = ApplicationChangeTypeStepsEnum.prescribedBody;
      } else {
        this.stepIdx = ApplicationChangeTypeStepsEnum.confirmation;
      }
    } else {
      this.stepIdx += 1;
    }
  }

  async back() {
    this.stepIdx -= 1;
  }

  onSelectPrescribedBody(name: string) {
    this.prescribedBody = name;
  }
}
