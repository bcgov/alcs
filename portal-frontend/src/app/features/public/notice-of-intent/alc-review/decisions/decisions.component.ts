import { Component, Input } from '@angular/core';
import { NoticeOfIntentPortalDecisionDto } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.service';
import { openFileWindow } from '../../../../../shared/utils/file';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() decisions: NoticeOfIntentPortalDecisionDto[] = [];

  constructor(private decisionService: NoticeOfIntentDecisionService) {}

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.decisionService.openFile(file.uuid);
    if (res) {
      openFileWindow(res.url, file.fileName);
    }
  }
}
