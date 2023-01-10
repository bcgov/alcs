import { AfterContentChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationTypeDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';

export enum ApplicationChangeTypeStepsEnum {
  warning = 0,
  applicationType = 1,
  confirmation = 2,
}

@Component({
  selector: 'app-change-application-type-dialog',
  templateUrl: './change-application-type-dialog.component.html',
  styleUrls: ['./change-application-type-dialog.component.scss'],
})
export class ChangeApplicationTypeDialogComponent implements OnInit, AfterContentChecked {
  fileId: string;

  applicationTypes: ApplicationTypeDto[] = [];
  selectedAppType: ApplicationTypeDto | undefined = undefined;

  readMoreClicked: boolean = false;
  isReadMoreVisible: boolean = false;

  warningStep = ApplicationChangeTypeStepsEnum.warning;
  applicationTypeStep = ApplicationChangeTypeStepsEnum.applicationType;
  confirmationStep = ApplicationChangeTypeStepsEnum.confirmation;

  stepIdx = 0;

  constructor(
    private dialogRef: MatDialogRef<ChangeApplicationTypeDialogComponent>,
    private applicationService: ApplicationService,
    private codeService: CodeService,
    @Inject(MAT_DIALOG_DATA) public data: ChangeApplicationTypeDialogComponent
  ) {
    this.fileId = data.fileId;
  }

  ngOnInit(): void {
    this.loadCodes();
  }

  ngAfterContentChecked() {
    this.isReadMoreVisible = this.checkIfReadMoreVisible();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes.filter((type) => !!type.portalLabel);
  }

  async onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onSubmit() {
    const result = await this.applicationService.updatePending(this.fileId, { typeCode: this.selectedAppType!.code });
    if (result) {
      this.onCancel(true);
    }
  }

  async onAppTypeSelected(event: MatRadioChange) {
    this.selectedAppType = this.applicationTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;
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
  }

  async next() {
    this.stepIdx += 1;
  }

  async back() {
    this.stepIdx -= 1;
  }
}
