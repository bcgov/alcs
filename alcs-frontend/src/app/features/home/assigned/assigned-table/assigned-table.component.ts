import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CardDto } from '../../../../services/card/card.dto';
import { ApplicationPill } from '../../../../shared/application-type-pill/application-type-pill.component';

export interface AssignedToMeFile {
  title: string;
  activeDays?: number | null;
  type: string;
  date?: number;
  paused?: boolean;
  card: CardDto;
  highPriority?: boolean;
  labels: ApplicationPill[];
}

@Component({
  selector: 'app-assigned-table',
  templateUrl: './assigned-table.component.html',
  styleUrls: ['./assigned-table.component.scss'],
})
export class AssignedTableComponent {
  @Input() assignedFiles: AssignedToMeFile[] = [];

  // displayedColumns = ['highPriority', 'title', 'type', 'activeDays', 'stage'];

  constructor(private router: Router) {}

  async onSelectCard(card: CardDto) {
    await this.router.navigateByUrl(`/board/${card.boardCode}?card=${card.uuid}&type=${card.type}`);
  }

  get displayedColumns(): string[] {
    // Include all default columns
    const columns = ['highPriority', 'title', 'type', 'activeDays', 'stage'];

    // Check if any file has type 'NOTI'
    const hasNoti = this.assignedFiles.some(file => file.type === 'NOTI');

    // If 'NOTI' type exists, remove 'activeDays' column
    if (hasNoti) {
      const index = columns.indexOf('activeDays');
      if (index !== -1) {
        columns.splice(index, 1);
      }
    }

    return columns;
  }
}
