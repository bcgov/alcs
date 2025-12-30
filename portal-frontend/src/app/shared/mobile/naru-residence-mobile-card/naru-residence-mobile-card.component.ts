import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import {
  FormExisingResidence,
  FormProposedResidence,
} from '../../../features/applications/edit-submission/proposal/naru-proposal/naru-proposal.component';
import { isTruncated, truncate } from '../../utils/string-helper';
import { EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT_MOBILE } from '../../constants';

@Component({
    selector: 'app-naru-residence-mobile-card',
    templateUrl: './naru-residence-mobile-card.component.html',
    styleUrl: './naru-residence-mobile-card.component.scss',
    standalone: false
})
export class NaruResidenceMobileCardComponent implements OnInit {
  @Input() residence!: FormExisingResidence | FormProposedResidence;
  @Input() isLast: boolean = false;
  @Input() isReviewStep: boolean = false;
  @Input() showErrors: boolean = false;
  @Output() editClicked = new EventEmitter<FormExisingResidence>();
  @Output() removeClicked = new EventEmitter<FormExisingResidence>();

  isError: boolean = false;

  ngOnInit(): void {
    if (this.residence.floorArea === 0 || this.residence.description === '') {
      this.isError = true;
    }
  }

  onEdit() {
    this.editClicked.emit(this.residence);
  }

  onRemove() {
    this.removeClicked.emit(this.residence);
  }

  getTruncatedDescription(description: string): string {
    return truncate(description, EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT_MOBILE);
  }

  isDescriptionTruncated(description: string): boolean {
    return isTruncated(description, EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT_MOBILE);
  }

  toggleReadMore(existingResidence: FormExisingResidence) {
    this.residence.isExpanded = !this.residence.isExpanded;
  }
}
