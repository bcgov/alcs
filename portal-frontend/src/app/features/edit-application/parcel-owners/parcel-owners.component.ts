import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ApplicationOwnerDialogComponent } from '../application-owner-dialog/application-owner-dialog.component';

@Component({
  selector: 'app-parcel-owners[owners]',
  templateUrl: './parcel-owners.component.html',
  styleUrls: ['./parcel-owners.component.scss'],
})
export class ParcelOwnersComponent {
  @Output() onAppUpdated = new EventEmitter<void>();

  @Input()
  public set owners(owners: ApplicationOwnerDto[]) {
    this._owners = owners.sort((a, b) => {
      if (a.displayName < b.displayName) {
        return -1;
      }
      if (a.displayName > b.displayName) {
        return 1;
      }
      return 0;
    });
  }

  @Input() parcelUuid?: string | undefined;

  _owners: ApplicationOwnerDto[] = [];
  displayedColumns = ['position', 'displayName', 'phone', 'email', 'type', 'actions'];

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
      .subscribe((isDirty) => {
        if (isDirty) {
          this.onAppUpdated.emit();
        }
      });
  }

  async onRemove(uuid: string) {
    if (this.parcelUuid) {
      await this.appOwnerService.removeFromParcel(uuid, this.parcelUuid);
      this.onAppUpdated.emit();
    } else {
      console.error('Parcel Component is misconfigured');
    }
  }

  async onDelete(owner: ApplicationOwnerDto) {
    this.confDialogService
      .openDialog({
        body: `This action will remove ${owner.displayName} and its usage from the entire application. Are you sure you want to remove this owner? `,
      })
      .subscribe(async (didConfirm) => {
        debugger;
        if (didConfirm) {
          await this.appOwnerService.delete(owner.uuid);
          this.onAppUpdated.emit();
        }
      });
  }
}
