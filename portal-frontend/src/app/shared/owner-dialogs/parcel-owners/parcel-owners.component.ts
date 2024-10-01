import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
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
import { openFileInline } from '../../utils/file';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { MOBILE_BREAKPOINT } from '../../utils/breakpoints';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-parcel-owners[owners][fileId][submissionUuid][ownerService]',
  templateUrl: './parcel-owners.component.html',
  styleUrls: ['./parcel-owners.component.scss'],
})
export class ParcelOwnersComponent implements OnInit{
  @Output() saveParcel = new EventEmitter<void>();
  @Output() onOwnersUpdated = new EventEmitter<ApplicationOwnerDto>();
  @Output() onOwnerRemoved = new EventEmitter<string>();
  @Output() onOwnersDeleted = new EventEmitter<string>();

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  @Input() ownerService!: ApplicationOwnerService | NoticeOfIntentOwnerService;
  @Input() documentService!: ApplicationDocumentService | NoticeOfIntentDocumentService;
  dataSource = new MatTableDataSource([]);
  sortedOwners: any[] = [];

  @Input()
  public set owners(owners: ApplicationOwnerDto[] | NoticeOfIntentOwnerDto[]) {
    const sorted = owners.sort(this.sortOwners);
    // @ts-ignore
    this.dataSource = new MatTableDataSource(sorted);
    this.sortedOwners = sorted;
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
  isMobile = false;
  VISIBLE_COUNT = 5;
  visibleCount = this.VISIBLE_COUNT;

  constructor(private dialog: MatDialog, private confirmationDialogService: ConfirmationDialogService) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

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
          this.onOwnersUpdated.emit(result);
        }
      }
    });
  }

  async onRemove(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: `Warning: Do you want to continue?`,
        title: 'Remove Parcel Owner',
      })
      .subscribe(async (answer) => {
        console.log(answer);
        if (answer) {
          this.onOwnerRemoved.emit(uuid);
        }
      });
  }

  async onOpenFile(file: ApplicationDocumentDto | NoticeOfIntentDocumentDto) {
    const res = await this.documentService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  async increaseVisibleCount() {
    if (this.sortedOwners.length - this.visibleCount >= this.VISIBLE_COUNT) {
      this.visibleCount += this.VISIBLE_COUNT;
    } else {
      this.visibleCount += this.sortedOwners.length - this.visibleCount;
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
