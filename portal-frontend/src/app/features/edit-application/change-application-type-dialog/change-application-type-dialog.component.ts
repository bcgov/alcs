import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationTypeDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';

@Component({
  selector: 'app-change-application-type-dialog',
  templateUrl: './change-application-type-dialog.component.html',
  styleUrls: ['./change-application-type-dialog.component.scss'],
})
export class ChangeApplicationTypeDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  selectedAppType: ApplicationTypeDto | undefined = undefined;

  readMoreClicked: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ChangeApplicationTypeDialogComponent>,
    private applicationService: ApplicationService,
    private codeService: CodeService
  ) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes.filter((type) => !!type.portalLabel);
  }

  async onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    console.log('submit');
    this.onCancel();
  }

  async onAppTypeSelected(event: MatRadioChange) {
    this.selectedAppType = this.applicationTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    return el ? el.clientHeight < el.scrollHeight : false;
  }

  isReadMoreVisible(): boolean {
    return this.readMoreClicked || this.isEllipsisActive('appTypeDescription');
  }

  onReadMoreClicked() {
    this.readMoreClicked = !this.readMoreClicked;
  }
}
