import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { NoticeOfIntentDocumentDto } from "../../../../../services/notice-of-intent-document/notice-of-intent-document.dto";

@Component({
    selector: 'app-other-attachments-card',
    templateUrl: './other-attachments-card.component.html',
    styleUrl: './other-attachments-card.component.scss',
})
export class OtherAttachmentsCardComponent implements OnInit {

    @Input() file!: NoticeOfIntentDocumentDto;
    @Output() editClicked = new EventEmitter<NoticeOfIntentDocumentDto>();
    @Output() removeClicked = new EventEmitter<NoticeOfIntentDocumentDto>();
    @Output() fileClicked = new EventEmitter<NoticeOfIntentDocumentDto>();

    ngOnInit(): void { }

    onEdit() {
        this.editClicked.emit(this.file);
    }

    onRemove() {
        this.removeClicked.emit(this.file);
    }

    onClick() {
        this.fileClicked.emit(this.file);
    }
}
