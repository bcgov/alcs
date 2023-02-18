import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationOwnerDto } from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ApplicationOwnerDialogComponent } from '../application-owner-dialog/application-owner-dialog.component';

@Component({
  selector: 'app-parcel-owners[owners]',
  templateUrl: './parcel-owners.component.html',
  styleUrls: ['./parcel-owners.component.scss'],
})
export class ParcelOwnersComponent {
  @Output() onOwnersUpdated = new EventEmitter<void>();
  @Output() onOwnerRemoved = new EventEmitter<string>();

  @Input()
  public set owners(owners: ApplicationOwnerDto[]) {
    this._owners = owners.sort(this.appOwnerService.sortOwners);
  }

  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  @Input() parcelUuid?: string | undefined;

  _owners: ApplicationOwnerDto[] = [];
  displayedColumns = ['position', 'displayName', 'phone', 'email', 'type', 'actions'];

  _disabled: boolean = false;

  constructor(
    private dialog: MatDialog,
    private appOwnerService: ApplicationOwnerService,
    private confDialogService: ConfirmationDialogService
  ) {}

  onEdit(owner: ApplicationOwnerDto) {
    this.dialog
      .open(ApplicationOwnerDialogComponent, {
        data: {
          parcelUuid: this.parcelUuid,
          existingOwner: owner,
        },
      })
      .beforeClosed()
      .subscribe((updatedUuid) => {
        if (updatedUuid) {
          this.onOwnersUpdated.emit();
        }
      });
  }

  async onRemove(uuid: string) {
    this.onOwnerRemoved.emit(uuid);
  }

  async onDelete(owner: ApplicationOwnerDto) {
    this.confDialogService
      .openDialog({
        body: `This action will remove ${owner.displayName} and its usage from the entire application. Are you sure you want to remove this owner? `,
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          await this.appOwnerService.delete(owner.uuid);
          this.onOwnersUpdated.emit();
        }
      });
  }
}
