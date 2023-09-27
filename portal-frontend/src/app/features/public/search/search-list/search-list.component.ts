import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationStatusDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationRegionDto } from '../../../../services/code/code.dto';
import { ApplicationSearchResultDto, BaseSearchResultDto } from '../../../../services/search/search.dto';
import { SearchResult } from '../search.interface';

const CLASS_TO_URL_MAP: Record<string, string> = {
  APP: 'application',
  NOI: 'notice-of-intent',
  NOTI: 'notification',
};

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss'],
})
export class SearchListComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @Input() totalCount = 0;
  @Input() statuses: ApplicationStatusDto[] = [];
  @Input() regions: ApplicationRegionDto[] = [];

  _results: SearchResult[] = [];
  @Input() set results(results: BaseSearchResultDto[]) {
    this._results = this.mapResults(results);
    this.visibleCount = this._results.length;
  }

  @Output() loadMore = new EventEmitter<void>();
  visibleCount = 0;

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSelectRecord(record: SearchResult) {
    const targetUrl = CLASS_TO_URL_MAP[record.class];
    await this.router.navigateByUrl(`/${targetUrl}/${record.referenceId}`);
  }

  private mapResults(applications: ApplicationSearchResultDto[]): SearchResult[] {
    return applications.map((e) => {
      const status = this.statuses.find((st) => st.code === e.status);

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
