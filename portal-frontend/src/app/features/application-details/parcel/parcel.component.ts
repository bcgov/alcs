import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../shared/utils/boolean-helper';

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

interface ApplicationParcelExtended extends Omit<ApplicationParcelUpdateDto, 'ownerUuids'> {
  parcelType: string;
  isFarmText?: string;
  ownershipType?: BaseCodeDto;
  validation?: ApplicationParcelBasicValidation;
  documents: ApplicationDocumentDto[];
  owners: ApplicationOwnerDto[];
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

  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() parcelType: PARCEL_TYPE = PARCEL_TYPE.APPLICATION;

  pageTitle: string = '1. Identify Parcel(s) Under Application';
  showCertificateOfTitle: boolean = true;
  navigationStepInd = 0;

  fileId: string = '';
  parcels: ApplicationParcelExtended[] = [];

  constructor(
    private applicationParcelService: ApplicationParcelService,
    private ownerService: ApplicationOwnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadParcels().then(async () => await this.validateParcelDetails());
      }
    });

    if (this.parcelType === PARCEL_TYPE.OTHER) {
      this.pageTitle = '2. Other Parcels in the Community';
      this.showCertificateOfTitle = false;
      this.navigationStepInd = 1;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    this.parcels = parcels
      .filter((p) => p.parcelType === this.parcelType)
      .map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));
  }

  private async validateParcelDetails() {
    if (this.showErrors) {
      if (this.parcels) {
        this.parcels.forEach((p) => {
          p.validation = this.validateParcelBasic(p);
        });
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

    if (this.showCertificateOfTitle && (!parcel.documents || (parcel.documents && parcel.documents.length <= 0))) {
      validation.isCertificateRequired = true;
    }

    // TODO replace this with checking if there at least one error object on the page?
    validation.isInvalid = this.isInvalid(validation);

    return validation;
  }

  private isInvalid(validationObj: ApplicationParcelBasicValidation) {
    for (const prop in validationObj) {
      if (validationObj[prop as keyof typeof validationObj]) {
        return true;
      }
    }

    return false;
  }

  onEditParcelsClick($event: any) {
    $event.stopPropagation();
    this.router.navigateByUrl(`application/${this.fileId}/edit/${this.navigationStepInd}?errors=t`);
  }

  onEditParcelClick(uuid: string) {
    this.router.navigateByUrl(`application/${this.fileId}/edit/${this.navigationStepInd}?parcelUuid=${uuid}&errors=t`);
  }
}
