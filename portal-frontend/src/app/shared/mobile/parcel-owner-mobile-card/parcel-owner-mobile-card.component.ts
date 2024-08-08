import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ApplicationOwnerDto } from "../../../services/application-owner/application-owner.dto";
import { NoticeOfIntentOwnerDto } from "../../../services/notice-of-intent-owner/notice-of-intent-owner.dto";

@Component({
    selector: 'app-parcel-owner-mobile-card',
    templateUrl: './parcel-owner-mobile-card.component.html',
    styleUrl: './parcel-owner-mobile-card.component.scss',
})
export class ParcelOwnerMobileCardComponent implements OnInit {
    @Input() owner!: ApplicationOwnerDto | NoticeOfIntentOwnerDto;
    @Input() isLast: boolean = false;
    @Input() isReviewStep: boolean = false;
    @Input() isCrown: boolean = false;
    @Output() editClicked = new EventEmitter<ApplicationOwnerDto | NoticeOfIntentOwnerDto>();
    @Output() removeClicked = new EventEmitter<ApplicationOwnerDto | NoticeOfIntentOwnerDto>();
    @Output() openFileClicked = new EventEmitter<ApplicationOwnerDto | NoticeOfIntentOwnerDto>();

    ngOnInit(): void { }

    onEdit() {
        this.editClicked.emit(this.owner);
    }

    onRemove() {
        this.removeClicked.emit(this.owner);
    }

    onOpenFile() {
        this.openFileClicked.emit(this.owner);
    }

}
