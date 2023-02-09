import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { APPLICATION_OWNER_TYPE, ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../shared/utils/boolean-helper';

export const emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
export class ApplicationParcelBasicValidation {
  // indicates general validity check state, including owner related information
  isInvalid: boolean = false;

  isTypeRequired: boolean = false;
  isPidRequired: boolean = false;
  isPinRequired: boolean = false;
  isLegalDescriptionRequired: boolean = false;
  isMapAreaHectaresRequired: boolean = false;
  isPurchasedDateRequired: boolean = false;
  isFarmRequired: boolean = false;
  isCertificateRequired: boolean = false;
}

export class ApplicationParcelOwnerBasicValidation {
  isInvalid: boolean = false;
  isTypeRequired: boolean = false;
  isFirstNameRequired: boolean = false;
  isLastNameRequired: boolean = false;
  isPhoneNumberRequired: boolean = false;
  isPhoneNumberInvalid: boolean = false;
  isEmailRequired: boolean = false;
  isEmailInvalid: boolean = false;
  isCorporateSummaryRequired: boolean = false;
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
  @Input() isValidate: boolean = false;

  fileId: string = '';

  parcelsWithOwners: any[] = [];

  parcels: ApplicationParcelExtended[] = [];
  showErrors = true;

  parcelSectionIsValid = true;

  ownerTableDisplayColumns = ['ownerType', 'fullName', 'phone', 'email', 'corporateSummary'];

  constructor(
    private applicationParcelService: ApplicationParcelService,
    private ownerService: ApplicationOwnerService,
    private router: Router
  ) {}

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
            if (o.validation.isInvalid || p.validation?.isInvalid) {
              this.parcelSectionIsValid = false;
            }
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

  async onOpenCorporateSummaryFile(uuid: string) {
    const res = await this.ownerService.openCorporateSummary(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private validateParcelBasic(parcel: ApplicationParcelDto) {
    const validation = new ApplicationParcelBasicValidation();

    if (!parcel.ownershipType) {
      validation.isTypeRequired = true;

      if (!parcel.pid && !parcel.pin) {
        validation.isPidRequired = true;
        validation.isPinRequired = true;
      }

      if (!parcel.purchasedDate) {
        validation.isPurchasedDateRequired = true;
      }
    }

    if (!parcel.pid && parcel.ownershipType?.code === 'SMPL') {
      validation.isPidRequired = true;
    }

    if (!parcel.pin && parcel.ownershipType?.code === 'CRWN') {
      validation.isPinRequired = true;
    }

    if (!parcel.legalDescription) {
      validation.isLegalDescriptionRequired = true;
    }

    if (!parcel.mapAreaHectares) {
      validation.isMapAreaHectaresRequired = true;
    }

    if (!parcel.purchasedDate && parcel.ownershipType?.code === 'SMPL') {
      validation.isPurchasedDateRequired = true;
    }

    if (!parcel.isFarm) {
      validation.isFarmRequired = true;
    }

    if (!parcel.documents || (parcel.documents && parcel.documents.length <= 0)) {
      validation.isCertificateRequired = true;
    }

    validation.isInvalid = this.isInvalid(validation);

    return validation;
  }

  private validateOwner(owner: OwnerWithValidation) {
    const validation = new ApplicationParcelOwnerBasicValidation();
    if (!owner.type) {
      validation.isTypeRequired = true;
    }

    if (!owner.firstName) {
      validation.isFirstNameRequired = true;
    }

    if (!owner.lastName) {
      validation.isLastNameRequired = true;
    }

    if (!owner.phoneNumber) {
      validation.isPhoneNumberRequired = true;
    } else {
      validation.isPhoneNumberInvalid = owner.phoneNumber.length !== 10;
    }

    if (!owner.email) {
      validation.isEmailRequired = true;
    } else {
      validation.isEmailInvalid = this.validateEmail(owner.email);
    }

    if (owner.type?.code === APPLICATION_OWNER_TYPE.ORGANIZATION) {
      validation.isCorporateSummaryRequired = !owner.corporateSummary?.uuid;
    }

    validation.isInvalid = this.isInvalid(validation);
    return validation;
  }

  private validateEmail(email: string) {
    const re = new RegExp(emailRegex);
    return re.test(email);
  }

  private isInvalid(validationObj: ApplicationParcelOwnerBasicValidation | ApplicationParcelBasicValidation) {
    for (const prop in validationObj) {
      if (prop) {
        return true;
      }
    }

    return false;
  }

  onEditParcelsClick($event: any) {
    $event.stopPropagation();
    this.router.navigateByUrl(`application/${this.fileId}/edit/0`);
  }

  onEditParcelClick(uuid: string) {
    this.router.navigateByUrl(`application/${this.fileId}/edit/0?parcelUuid=${uuid}`);
  }
}
