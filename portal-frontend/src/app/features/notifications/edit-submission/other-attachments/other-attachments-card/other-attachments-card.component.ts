import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { NotificationDocumentDto } from "../../../../../services/notification-document/notification-document.dto";

@Component({
    selector: 'app-other-attachments-card',
    templateUrl: './other-attachments-card.component.html',
    styleUrl: './other-attachments-card.component.scss',
})
export class OtherAttachmentsCardComponent implements OnInit {
    @Input() file!: NotificationDocumentDto;
    @Output() editClicked = new EventEmitter<NotificationDocumentDto>();
    @Output() removeClicked = new EventEmitter<NotificationDocumentDto>();
    @Output() fileClicked = new EventEmitter<NotificationDocumentDto>();
    
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
