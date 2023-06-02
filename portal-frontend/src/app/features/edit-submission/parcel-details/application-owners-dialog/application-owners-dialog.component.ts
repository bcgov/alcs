import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationOwnerDto, APPLICATION_OWNER } from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';

@Component({
  selector: 'app-application-owner-dialog',
  templateUrl: './application-owners-dialog.component.html',
  styleUrls: ['./application-owners-dialog.component.scss'],
})
export class ApplicationOwnersDialogComponent {
  isDirty = false;
  owners: ApplicationOwnerDto[] = [];
  fileId: string;
  submissionUuid: string;

  constructor(
    private applicationOwnerService: ApplicationOwnerService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      owners: ApplicationOwnerDto[];
      fileId: string;
      submissionUuid: string;
    }
  ) {
    this.fileId = data.fileId;
    this.submissionUuid = data.submissionUuid;
    this.owners = data.owners;
  }

  async onUpdated() {
    const updatedOwners = await this.applicationOwnerService.fetchBySubmissionId(this.submissionUuid);
    if (updatedOwners) {
      this.owners = updatedOwners.filter((owner) => owner.type.code !== APPLICATION_OWNER.AGENT);
      this.isDirty = true;
    }
  }
}
