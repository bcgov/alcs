import { Component, Input } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../../services/application-decision/application-decision.service';
import { openFileInline } from '../../../../../shared/utils/file';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() applicationDecisions: ApplicationPortalDecisionDto[] = [];

  constructor(private decisionService: ApplicationDecisionService) {}

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.decisionService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }
}
