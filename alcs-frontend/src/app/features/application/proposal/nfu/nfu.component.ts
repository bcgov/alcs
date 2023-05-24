import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../../services/application/application.dto';
import { ToastService } from '../../../../services/toast/toast.service';

// TODO move to code tables?
export const NFU_TYPES_OPTIONS = [
  {
    label: 'Agricultural / Farm',
    value: 'Agricultural / Farm',
  },
  {
    label: 'Civic / Institutional',
    value: 'Civic / Institutional',
  },
  {
    label: 'Commercial / Retail',
    value: 'Commercial / Retail',
  },
  {
    label: 'Industrial',
    value: 'Industrial',
  },
  {
    label: 'Other',
    value: 'Other',
  },
  {
    label: 'Recreational',
    value: 'Recreational',
  },
  {
    label: 'Residential',
    value: 'Residential',
  },
  {
    label: 'Transportation / Utilities',
    value: 'Transportation / Utilities',
  },
  {
    label: 'Unused',
    value: 'Unused',
  },
];

export const NFU_SUBTYPES_OPTIONS = [
  {
    label: 'Alcohol Processing',
    value: 'Alcohol Processing',
  },
  {
    label: 'Cement / Asphalt / Concrete Plants',
    value: 'Cement / Asphalt / Concrete Plants',
  },
  {
    label: 'Commercial / Retail',
    value: 'Commercial / Retail',
  },
  {
    label: 'Deposition / Fill (All Types)',
    value: 'Deposition / Fill (All Types)',
  },
  {
    label: 'Energy Production',
    value: 'Energy Production',
  },
  {
    label: 'Recreational',
    value: 'Recreational',
  },
  {
    label: 'Food Processing (Non-Meat)',
    value: 'Food Processing (Non-Meat)',
  },
  {
    label: 'Industrial - Other',
    value: 'Industrial - Other',
  },
  {
    label: 'Logging Operations',
    value: 'Logging Operations',
  },
  {
    label: 'Lumber Manufacturing and Re-Manufacturing',
    value: 'Lumber Manufacturing and Re-Manufacturing',
  },
  {
    label: 'Meat and Fish Processing (+ Abattoir)',
    value: 'Meat and Fish Processing (+ Abattoir)',
  },
  {
    label: 'Mining',
    value: 'Mining',
  },
  {
    label: 'Miscellaneous Processing',
    value: 'Miscellaneous Processing',
  },
  {
    label: 'Oil and Gas Activities',
    value: 'Oil and Gas Activities',
  },
  {
    label: 'Sand & Gravel',
    value: 'Sand & Gravel',
  },
  {
    label: 'Sawmill',
    value: 'Sawmill',
  },
  {
    label: 'Storage and Warehouse Facilities (Indoor/Outdoor - Large Scale Structures)',
    value: 'Storage and Warehouse Facilities (Indoor/Outdoor - Large Scale Structures)',
  },
  {
    label: 'Work Camps or Associated Use',
    value: 'Work Camps or Associated Use',
  },
];

@Component({
  selector: 'app-proposal-nfu',
  templateUrl: './nfu.component.html',
  styleUrls: ['./nfu.component.scss'],
})
export class NfuProposalComponent implements OnDestroy, OnInit {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;

  nfuTypes = NFU_TYPES_OPTIONS;
  nfuSubTypes = NFU_SUBTYPES_OPTIONS;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
      }
    });
  }

  async updateApplicationValue(field: keyof UpdateApplicationDto, value: string | number | null) {
    const application = this.application;
    if (application) {
      const update = await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Application updated');
      }
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
