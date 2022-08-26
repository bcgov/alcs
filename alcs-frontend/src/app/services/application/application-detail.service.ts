import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailedDto, ApplicationPartialDto } from './application.dto';
import { ApplicationService } from './application.service';

@Injectable()
export class ApplicationDetailService {
  $application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

  private selectedFileNumber: string | undefined;

  constructor(private applicationService: ApplicationService) {}

  async loadApplication(fileNumber: string) {
    this.selectedFileNumber = fileNumber;
    const application = await this.applicationService.fetchApplication(fileNumber);
    this.$application.next(application);
  }

  async updateApplication(application: ApplicationPartialDto) {
    const updatedApp = await this.applicationService.updateApplication(application);
    if (updatedApp) {
      this.$application.next(updatedApp);
    }
  }
}
