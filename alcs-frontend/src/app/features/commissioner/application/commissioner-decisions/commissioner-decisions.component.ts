import { Component, Input, type OnInit } from '@angular/core';
import { CommissionerDecisionDto } from '../../../../services/commissioner/commissioner.dto';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ApplicationDocumentDto } from '../../../../services/application/application-document/application-document.dto';

@Component({
  selector: 'app-commissioner-decisions',
  templateUrl: './commissioner-decisions.component.html',
  styleUrl: './commissioner-decisions.component.scss',
})
export class CommissionerDecisionsComponent {
  @Input() applicationDecisions: CommissionerDecisionDto[] = [];
  constructor(private decisionService: ApplicationDecisionV2Service) {}

  async openFile(decision: CommissionerDecisionDto, file: ApplicationDocumentDto) {
    const res = await this.decisionService.downloadFile(decision.uuid, file.uuid, file.fileName);
  }
}
