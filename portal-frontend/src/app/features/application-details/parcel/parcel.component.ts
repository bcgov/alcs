import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../shared/utils/boolean-helper';

export class ApplicationParcelBasicValidation {
  isTypeValid: boolean = true;
  isPidValid: boolean = true;
  isPinValid: boolean = true;
  isLegalDescriptionValid: boolean = true;
  isMapAreaHectaresValid: boolean = true;
  isPurchasedDateValid: boolean = true;
  isFarmValid: boolean = true;
  isCertificateValid: boolean = true;
}

export class ApplicationParcelOwnerBasicValidation {
  isTypeValid: boolean = true;
  isFirstNameValid: boolean = true;
  isLastNameValid: boolean = true;
  isPhoneNumberValid: boolean = true;
  isEmailValid: boolean = true;
}

interface OwnerWithValidation extends ApplicationOwnerDto {
  validation?: ApplicationParcelOwnerBasicValidation;
}

interface ApplicationParcelExtended extends Omit<ApplicationParcelUpdateDto, 'ownerUuids'> {
  parcelType: string;
  isFarmText?: string;
  ownershipType?: BaseCodeDto;
  validation?: ApplicationParcelBasicValidation;
  documents: ApplicationDocumentDto[];
  owners: OwnerWithValidation[];
}

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent {
  // TODO instead of providing application load parcel as input or in addition to application
  $destroy = new Subject<void>();

  @Output() isParcelDetailsValid: EventEmitter<boolean> = new EventEmitter(false);

  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
  @Input() isValidate: boolean = true;

  fileId: string = '';

  parcelsWithOwners: any[] = [];

  parcels: ApplicationParcelExtended[] = [];
  showErrors = true;

  constructor(private applicationParcelService: ApplicationParcelService) {}

  ngOnInit(): void {
    this.showErrors = this.isValidate;
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadParcels().then(async () => await this.validateParcelDetails());
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    this.parcels = parcels
      .filter((p) => p.parcelType === PARCEL_TYPE.APPLICATION)
      .map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));
    console.log('loadParcels', parcels);
  }

  private async validateParcelDetails() {
    if (this.isValidate) {
      if (this.parcels) {
        this.parcels.forEach((p) => {
          p.validation = this.validateParcelBasic(p);
          p.owners.forEach((o) => {
            o.validation = this.validateOwner(o);
          });
        });

        console.log('validateParcelDetails', this.parcels);
      }
    }

    this.isParcelDetailsValid.emit(false);
  }

  async onOpenFile(uuid: string) {
    const res = await this.applicationParcelService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private validateParcelBasic(parcel: ApplicationParcelDto) {
    const validation = new ApplicationParcelBasicValidation();

    if (!parcel.ownershipType) {
      validation.isTypeValid = false;
    }

    if (!parcel.pid && !parcel.pin) {
      validation.isPidValid = false;
      validation.isPinValid = false;
    }

    if (!parcel.legalDescription) {
      validation.isLegalDescriptionValid = false;
    }

    if (!parcel.mapAreaHectares) {
      validation.isMapAreaHectaresValid = false;
    }

    if (!parcel.purchasedDate) {
      validation.isPurchasedDateValid = false;
    }

    if (!parcel.isFarm) {
      validation.isFarmValid = false;
    }

    if (!parcel.documents || (parcel.documents && parcel.documents.length <= 0)) {
      validation.isCertificateValid = false;
    }

    return validation;
  }

  private validateOwner(owner: OwnerWithValidation) {
    const validation = new ApplicationParcelOwnerBasicValidation();
    if (!owner.type) {
      validation.isTypeValid = false;
    }

    if (!owner.firstName) {
      validation.isFirstNameValid = false;
    }

    if (!owner.lastName) {
      validation.isLastNameValid = false;
    }

    if (!owner.phoneNumber) {
      validation.isPhoneNumberValid = false;
    }

    if (!owner.email) {
      validation.isEmailValid = false;
    }

    return validation;
  }
}
