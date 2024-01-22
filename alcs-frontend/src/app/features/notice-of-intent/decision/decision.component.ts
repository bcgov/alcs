import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { SYSTEM_SOURCE_TYPES } from '../../../shared/dto/system-source.types.dto';

@Component({
  selector: 'app-noi-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  SYSTEM_SOURCE_TYPES = SYSTEM_SOURCE_TYPES;
  noticeOfIntent: NoticeOfIntentDto | undefined;

  constructor(private noticeOfIntentDetailService: NoticeOfIntentDetailService) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.$destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.noticeOfIntent = noticeOfIntent;
      } else {
        this.noticeOfIntent = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
