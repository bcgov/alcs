import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { PARCEL_OWNERSHIP_TYPE } from '../../../services/application-parcel/application-parcel.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { OWNER_TYPE } from '../../dto/owner.dto';
import { CrownOwnerDialogComponent } from '../crown-owner-dialog/crown-owner-dialog.component';
import { OwnerDialogComponent } from '../owner-dialog/owner-dialog.component';

@Component({
  selector: 'app-parcel-owners[owners][fileId][submissionUuid][ownerService]',
  templateUrl: './parcel-owners.component.html',
  styleUrls: ['./parcel-owners.component.scss'],
})
export class ParcelOwnersComponent {
  @Output() saveParcel = new EventEmitter<void>();
  @Output() onOwnersUpdated = new EventEmitter<void>();
  @Output() onOwnerRemoved = new EventEmitter<string>();
  @Output() onOwnersDeleted = new EventEmitter<string>();

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  @Input() ownerService!: ApplicationOwnerService | NoticeOfIntentOwnerService;
  @Input() documentService!: ApplicationDocumentService | NoticeOfIntentDocumentService;
  dataSource = new MatTableDataSource([]);

  @Input()
  public set owners(owners: ApplicationOwnerDto[] | NoticeOfIntentOwnerDto[]) {
    const sorted = owners.sort(this.sortOwners);
    // @ts-ignore
    this.dataSource = new MatTableDataSource(sorted);
  }

  sortOwners(a: ApplicationOwnerDto | NoticeOfIntentOwnerDto, b: ApplicationOwnerDto | NoticeOfIntentOwnerDto) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
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

  _disabled = false;
  displayedColumns = ['displayName', 'organizationName', 'phone', 'email', 'corporateSummary', 'actions'];

  constructor(private dialog: MatDialog) {}

  onEdit(owner: ApplicationOwnerDto) {
    let dialog;
    this.saveParcel.emit();
    if (owner.type.code === OWNER_TYPE.CROWN) {
      dialog = this.dialog.open(CrownOwnerDialogComponent, {
        data: {
          isDraft: this.isDraft,
          parcelUuid: this.parcelUuid,
          existingOwner: owner,
          submissionUuid: this.submissionUuid,
          ownerService: this.ownerService,
        },
      });
    } else {
      dialog = this.dialog.open(OwnerDialogComponent, {
        data: {
          isDraft: this.isDraft,
          fileId: this.fileId,
          submissionUuid: this.submissionUuid,
          parcelUuid: this.parcelUuid,
          existingOwner: owner,
          ownerService: this.ownerService,
          documentService: this.documentService,
        },
      });
    }
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'delete') {
          this.onOwnersDeleted.emit();
        } else {
          this.onOwnersUpdated.emit();
        }
      }
    });
  }

  async onRemove(uuid: string) {
    this.onOwnerRemoved.emit(uuid);
  }

  async onOpenFile(uuid: string) {
    const res = await this.documentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
