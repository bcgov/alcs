import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { OWNER_TYPE } from '../../dto/owner.dto';

@Component({
  selector: 'app-all-owners-dialog',
  templateUrl: './all-owners-dialog.component.html',
  styleUrls: ['./all-owners-dialog.component.scss'],
})
export class AllOwnersDialogComponent {
  isDirty = false;
  owners: ApplicationOwnerDto[] | NoticeOfIntentOwnerDto[] = [];
  fileId: string;
  submissionUuid: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      owners: ApplicationOwnerDto[] | NoticeOfIntentOwnerDto[];
      fileId: string;
      submissionUuid: string;
      ownerService: ApplicationOwnerService | NoticeOfIntentOwnerService;
      documentService: ApplicationDocumentService | NoticeOfIntentDocumentService;
    }
  ) {
    this.fileId = data.fileId;
    this.submissionUuid = data.submissionUuid;
    this.owners = data.owners;
  }

  async onUpdated() {
    const updatedOwners = await this.data.ownerService.fetchBySubmissionId(this.submissionUuid);
    if (updatedOwners) {
      // @ts-ignore Bug with Typescript https://github.com/microsoft/TypeScript/issues/44373
      this.owners = updatedOwners.filter(
        (owner: { type: { code: OWNER_TYPE } }) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code)
      );
      this.isDirty = true;
    }
  }
}
