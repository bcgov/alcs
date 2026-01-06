import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationStatusDto } from '../../../../services/application-submission/application-submission.dto';
import { BaseSearchResultDto } from '../../../../services/search/search.dto';
import { SearchResult } from '../search.interface';

const CLASS_TO_URL_MAP: Record<string, string> = {
  APP: 'application',
  NOI: 'notice-of-intent',
  NOTI: 'notification',
};

@Component({
    selector: 'app-search-list[type]',
    templateUrl: './search-list.component.html',
    styleUrls: ['./search-list.component.scss'],
    standalone: false
})
export class SearchListComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @Input() totalCount = 0;
  @Input() pageIndex: number = 0;
  @Input() type = '';

  _statuses!: ApplicationStatusDto[];
  @Input() set statuses(statuses: ApplicationStatusDto[]) {
    this._statuses = statuses;
    this.mapResults();
  }

  _results: BaseSearchResultDto[] = [];
  @Input() set results(results: BaseSearchResultDto[]) {
    this._results = results;
    this.visibleCount = this._results.length;
    this.mapResults();
  }

  mappedResults: SearchResult[] = [];

  @Output() loadMore = new EventEmitter<void>();
  visibleCount = 0;

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSelectRecord(record: SearchResult) {
    const targetUrl = CLASS_TO_URL_MAP[record.class];
    await this.router.navigateByUrl(`/public/${targetUrl}/${record.referenceId}`);
  }

  private mapResults() {
    if (!this._results || !this._statuses) {
      return;
    }

    this.mappedResults = this._results.map((e) => {
      const status = this._statuses.find((st) => st.code === e.status);

      return {
        ...e,
        status,
      };
    });
  }

  onLoadMore() {
    this.loadMore.emit();
  }
}
