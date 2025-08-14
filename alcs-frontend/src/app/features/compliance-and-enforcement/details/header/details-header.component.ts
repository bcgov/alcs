import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import {
  Status,
  statusFromFile,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';

@Component({
  selector: 'app-compliance-and-enforcement-details-header',
  templateUrl: './details-header.component.html',
  styleUrls: ['./details-header.component.scss'],
})
export class DetailsHeaderComponent implements OnDestroy {
  Status = Status;

  $destroy = new Subject<void>();

  fileNumber?: string;
  status: Status | null = null;

  private _file?: ComplianceAndEnforcementDto;
  @Input() set file(file: ComplianceAndEnforcementDto | undefined) {
    if (file) {
      this._file = file;
      this.fileNumber = file?.fileNumber;
      this.status = statusFromFile(file);
    }
  }
  get file() {
    return this._file;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
