import { Component } from '@angular/core';
import { CardDto } from '../../../services/card/card.dto';
import {
  UnarchiveCardSearchResult,
  UnarchiveCardService,
} from '../../../services/unarchive-card/unarchive-card.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardType } from '../../../shared/card/card.component';

@Component({
    selector: 'app-unarchive',
    templateUrl: './unarchive.component.html',
    styleUrls: ['./unarchive.component.scss'],
    standalone: false
})
export class UnarchiveComponent {
  search = '';
  displayedColumns: string[] = ['type', 'status', 'createdAt', 'actions'];
  cards: UnarchiveCardSearchResult[] = [];

  constructor(
    private unarchiveCardService: UnarchiveCardService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  onUnarchive(uuid: string) {
    const answer = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to unarchive the selected card?',
    });
    answer.subscribe(async (answer) => {
      if (answer) {
        await this.unarchiveCardService.unarchiveCard(uuid);
        await this.onSearch();
      }
    });
  }

  async onSearch() {
    const results = await this.unarchiveCardService.search(this.search);
    if (results) {
      results.forEach((result) => {
        if (result.type === CardType.APP_CON || result.type === CardType.NOI_CON) {
          result.type = 'Condition';
        }
      });
      this.cards = results;
    }
  }
}
