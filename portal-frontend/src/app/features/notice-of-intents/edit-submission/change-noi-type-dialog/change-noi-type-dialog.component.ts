import { AfterViewChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { NoticeOfIntentTypeDto } from '../../../../services/code/code.dto';
import { CodeService } from '../../../../services/code/code.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { scrollToElement } from '../../../../shared/utils/scroll-helper';

export enum NoiChangeTypeStepsEnum {
  warning = 0,
  noiType = 1,
  confirmation = 2,
}

@Component({
  selector: 'app-change-noi-type-dialog',
  templateUrl: './change-noi-type-dialog.component.html',
  styleUrls: ['./change-noi-type-dialog.component.scss'],
})
export class ChangeNoiTypeDialogComponent implements OnInit, AfterViewChecked {
  submissionUuid: string;
  submissionTypeCode: string;

  noiTypes: NoticeOfIntentTypeDto[] = [];
  selectedType: NoticeOfIntentTypeDto | undefined = undefined;

  readMoreClicked: boolean = false;
  isReadMoreVisible: boolean = false;

  warningStep = NoiChangeTypeStepsEnum.warning;
  applicationTypeStep = NoiChangeTypeStepsEnum.noiType;
  confirmationStep = NoiChangeTypeStepsEnum.confirmation;

  stepIdx = 0;

  constructor(
    private dialogRef: MatDialogRef<ChangeNoiTypeDialogComponent>,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private codeService: CodeService,
    @Inject(MAT_DIALOG_DATA) public data: ChangeNoiTypeDialogComponent
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
    this.noiTypes = codes.noticeOfIntentTypes
      .filter((type) => !!type.portalLabel)
      .sort((a, b) => (a.portalLabel > b.portalLabel ? 1 : -1));
  }

  async closeDialog(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onSubmit() {
    const result = await this.noticeOfIntentSubmissionService.updatePending(this.submissionUuid, {
      typeCode: this.selectedType!.code,
    });
    if (result) {
      await this.closeDialog(true);
    }
  }

  async onTypeSelected(event: MatRadioChange) {
    this.selectedType = this.noiTypes.find((e) => e.code === event.value);
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
    return this.readMoreClicked || this.isEllipsisActive('typeDescription');
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
    this.stepIdx += 1;
  }

  async back() {
    this.stepIdx -= 1;
  }
}
