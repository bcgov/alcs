import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Moment } from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CardService } from '../../../../../services/card/card.service';
import { InquiryParcelCreateDto } from '../../../../../services/inquiry/inquiry-parcel/inquiry-parcel.dto';
import { CreateInquiryDto, InquiryTypeDto } from '../../../../../services/inquiry/inquiry.dto';
import { InquiryService } from '../../../../../services/inquiry/inquiry.service';

@Component({
  selector: 'app-create-inquiry',
  templateUrl: './create-inquiry-dialog.component.html',
  styleUrls: ['./create-inquiry-dialog.component.scss'],
})
export class CreateInquiryDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  types: InquiryTypeDto[] = [];
  isLoading = false;
  currentStep = 0;

  regionControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  typeControl = new FormControl<string | null>(null, [Validators.required]);
  summaryControl = new FormControl<string | null>(null, [Validators.required]);
  submissionDateControl = new FormControl<Moment | null>(null, [Validators.required]);

  firstName = new FormControl<string | null>(null, []);
  lastName = new FormControl<string | null>(null, []);
  organization = new FormControl<string | null>(null, []);
  phone = new FormControl<string | null>(null, []);
  email = new FormControl<string | null>(null, [Validators.email]);

  displayedColumns = ['index', 'address', 'pid', 'pin', 'actions'];
  parcels: InquiryParcelCreateDto[] = [];
  tableSource: MatTableDataSource<InquiryParcelCreateDto> = new MatTableDataSource();

  createForm = new FormGroup({
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    type: this.typeControl,
    summary: this.summaryControl,
    submissionDate: this.submissionDateControl,
    firstName: this.firstName,
    lastName: this.lastName,
    organization: this.organization,
    phone: this.phone,
    email: this.email,
  });
  selectedType: InquiryTypeDto | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentBoardCode: string;
    },
    private dialogRef: MatDialogRef<CreateInquiryDialogComponent>,
    private inquiryService: InquiryService,
    private cardService: CardService,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.cardService.fetchCodes();

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

    this.loadTypes();
  }

  areParcelsValid() {
    return this.parcels.reduce((previousValue, parcel) => {
      const addressValid = !!parcel.civicAddress && parcel.civicAddress.length > 0;
      const pidValid = parcel.pid ? parcel.pid.length === 9 : true;
      return previousValue && pidValid && addressValid;
    }, true);
  }

  async onSubmit() {
    console.log(this.parcels);
    const form = this.createForm.valid;
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const createDto: CreateInquiryDto = {
        boardCode: this.data.currentBoardCode,
        submittedToAlcDate: formValues.submissionDate!.valueOf(),
        summary: formValues.summary!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        typeCode: formValues.type!,
        inquirerFirstName: formValues.firstName ?? undefined,
        inquirerLastName: formValues.lastName ?? undefined,
        inquirerOrganization: formValues.organization ?? undefined,
        inquirerEmail: formValues.email ?? undefined,
        inquirerPhone: formValues.phone ?? undefined,
        parcels: this.parcels,
      };

      const res = await this.inquiryService.create(createDto);
      this.dialogRef.close(true);
      if (res) {
        await this.router.navigate(this.activatedRoute.snapshot.url, {
          queryParams: res.card?.uuid && res.card.type ? { card: res.card.uuid, type: res.card.type } : {},
          relativeTo: this.activatedRoute,
        });
      }
    } finally {
      this.isLoading = false;
    }
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadTypes() {
    const types = await this.inquiryService.fetchTypes();
    if (types) {
      this.types = types;
    }
  }

  onNextStep() {
    this.currentStep = 1;
  }

  onPreviousStep() {
    this.currentStep = 0;
  }

  onChange($event: MatRadioChange) {
    const selectedType = this.types.find((type) => type.code === $event.value);
    if (selectedType) {
      this.selectedType = selectedType;
    }
  }

  onRemoveParcel(index: number) {
    this.parcels.splice(index, 1);
    this.tableSource = new MatTableDataSource(this.parcels);
  }

  onAddParcel() {
    this.parcels.push({
      civicAddress: '',
    });
    this.tableSource = new MatTableDataSource(this.parcels);
  }
}
