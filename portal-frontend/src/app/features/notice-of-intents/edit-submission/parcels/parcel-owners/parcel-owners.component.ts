import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NoticeOfIntentOwnerDto } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { OWNER_TYPE } from '../../../../../shared/dto/owner.dto';
import { ApplicationCrownOwnerDialogComponent } from '../../../../applications/edit-submission/parcel-details/application-crown-owner-dialog/application-crown-owner-dialog.component';
import { ApplicationOwnerDialogComponent } from '../../../../applications/edit-submission/parcel-details/application-owner-dialog/application-owner-dialog.component';

@Component({
  selector: 'app-parcel-owners[owners][fileId][submissionUuid]',
  templateUrl: './parcel-owners.component.html',
  styleUrls: ['./parcel-owners.component.scss'],
})
export class ParcelOwnersComponent {
  @Output() onOwnersUpdated = new EventEmitter<void>();
  @Output() onOwnerRemoved = new EventEmitter<string>();

  @Input()
  public set owners(owners: NoticeOfIntentOwnerDto[]) {
    this._owners = owners.sort(this.noticeOfIntentOwnerService.sortOwners);
  }

  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  @Input() submissionUuid!: string;
  @Input() fileId!: string;
  @Input() parcelUuid?: string | undefined;
  @Input() isCrown = false;
  @Input() isDraft = false;
  @Input() isShowAllOwners = false;

  _owners: NoticeOfIntentOwnerDto[] = [];
  _disabled = false;
  displayedColumns = ['type', 'position', 'displayName', 'organizationName', 'phone', 'email', 'actions'];

  constructor(
    private dialog: MatDialog,
    private noticeOfIntentOwnerService: NoticeOfIntentOwnerService,
    private confDialogService: ConfirmationDialogService
  ) {}

  onEdit(owner: NoticeOfIntentOwnerDto) {
    let dialog;
    if (owner.type.code === OWNER_TYPE.CROWN) {
      dialog = this.dialog.open(ApplicationCrownOwnerDialogComponent, {
        data: {
          isDraft: this.isDraft,
          parcelUuid: this.parcelUuid,
          existingOwner: owner,
          submissionUuid: this.submissionUuid,
        },
      });
    } else {
      dialog = this.dialog.open(ApplicationOwnerDialogComponent, {
        data: {
          isDraft: this.isDraft,
          fileId: this.fileId,
          submissionUuid: this.submissionUuid,
          parcelUuid: this.parcelUuid,
          existingOwner: owner,
        },
      });
    }
    dialog.beforeClosed().subscribe((updatedUuid) => {
      if (updatedUuid) {
        this.onOwnersUpdated.emit();
      }
    });
  }

  async onRemove(uuid: string) {
    this.onOwnerRemoved.emit(uuid);
  }

  async onDelete(owner: NoticeOfIntentOwnerDto) {
    this.confDialogService
      .openDialog({
        body: `This action will remove ${owner.displayName} and its usage from the entire application. Are you sure you want to remove this owner? `,
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          await this.noticeOfIntentOwnerService.delete(owner.uuid);
          this.onOwnersUpdated.emit();
        }
      });
  }
}
