import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';

@Component({
  selector: 'app-application-owner-dialog',
  templateUrl: './application-owners-dialog.component.html',
  styleUrls: ['./application-owners-dialog.component.scss'],
})
export class ApplicationOwnersDialogComponent {
  isDirty = false;
  owners: ApplicationOwnerDto[] = [];

  constructor(
    private applicationOwnerService: ApplicationOwnerService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      owners: ApplicationOwnerDto[];
      fileId: string;
    }
  ) {
    this.owners = data.owners;
  }

  async onUpdated() {
    const updatedOwners = await this.applicationOwnerService.fetchByFileId(this.data.fileId);
    if (updatedOwners) {
      this.owners = updatedOwners;
      this.isDirty = true;
    }
  }
}
