import { Component } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

// TODO move to code tables?
export const AG_CAP_OPTIONS = [
  {
    label: 'Mixed Prime and Secondary',
    value: 'Mixed Prime and Secondary',
  },
  {
    label: 'Prime',
    value: 'Prime',
  },
  {
    label: 'Prime Dominant',
    value: 'Prime Dominant',
  },
  {
    label: 'Secondary',
    value: 'Secondary',
  },
  {
    label: 'Unclassified',
    value: 'Unclassified',
  },
];

export const AG_CAP_SOURCE_OPTIONS = [
  {
    label: 'BCLI',
    value: 'BCLI',
  },
  {
    label: 'CLI',
    value: 'CLI',
  },
  {
    label: 'On-site',
    value: 'On-site',
  },
];

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
})
export class ProposalComponent {
  application?: ApplicationDto;

  agCapOptions = AG_CAP_OPTIONS;

  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;

  alrArea: string | undefined;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.application = application;
        this.alrArea = application.alrArea?.toString();
      }
    });
  }

  async onSaveAlrArea(value: string | null) {
    const parsedValue = value ? parseFloat(value) : null;
    await this.updateApplicationValue('alrArea', parsedValue);
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
}
