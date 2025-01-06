import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TagDto } from '../../../services/tag/tag.dto';
import { FileTagService } from '../../../services/common/file-tag.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { CommissionerApplicationDto } from '../../../services/commissioner/commissioner.dto';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NotificationDto } from '../../../services/notification/notification.dto';

@Component({
  selector: 'app-commissioner-tags-header',
  templateUrl: './commissioner-tags-header.component.html',
  styleUrl: './commissioner-tags-header.component.scss',
})
export class CommissionerTagsHeaderComponent implements OnInit, OnChanges {
  tags: TagDto[] = [];

  hovered = false;
  clicked = false;

  @Input() application: ApplicationDto | CommissionerApplicationDto | NoticeOfIntentDto | NotificationDto | undefined;
  @Input() isHidden: boolean = false;

  constructor(private fileTagService: FileTagService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['application'] && changes['application'].currentValue !== undefined) {
      this.initFileTags();
    }
  }
  async initFileTags() {
    const res = await this.fileTagService.getTags(this.application?.fileNumber!);
    this.tags = res!;
  }
}
