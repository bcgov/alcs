import { ChangeDetectionStrategy, Component, Input, type OnInit } from '@angular/core';
import { CommissionerDecisionDto } from '../../../../services/commissioner/commissioner.dto';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';

@Component({
  selector: 'app-decisions',
  templateUrl: './decisions.component.html',
  styleUrl: './decisions.component.scss',
})
export class DecisionsComponent implements OnInit {
  @Input() applicationDecisions: CommissionerDecisionDto[] = [];
  constructor(private decisionService: ApplicationDocumentService) {}
  ngOnInit(): void {}
}
