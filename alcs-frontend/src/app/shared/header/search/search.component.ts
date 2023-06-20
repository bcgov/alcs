import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { SearchResultDto } from '../../../services/search/search.dto';
import { SearchService } from '../../../services/search/search.service';
import { ToastService } from '../../../services/toast/toast.service';
import { COVENANT_TYPE_LABEL, PLANNING_TYPE_LABEL } from '../../application-type-pill/application-type-pill.constants';

interface SearchResult {
  title: string;
  class: string;
  type?: any;
  government?: string;
  referenceId: string;
  board?: string;
  label?: ApplicationTypeDto;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  searchText?: string;

  searchResults: SearchResult[] = [];
  displayedColumns = ['fileId', 'class', 'type', 'government'];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.pipe(takeUntil(this.$destroy)).subscribe((queryParamMap) => {
      const searchText = queryParamMap.get('searchText');

      if (searchText) {
        this.searchText = searchText;

        this.searchService
          .fetch(searchText)
          .then((result) => (this.searchResults = this.mapSearchResults(result ?? [])));
      }
    });
  }

  ngOnDestroy(): void {
    this.searchResults = [];
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSelectCard(record: SearchResult) {
    if (record.type && ['PLAN', 'COV'].includes(record.type)) {
      await this.router.navigateByUrl(`/board/${record.board}?card=${record.referenceId}&type=${record.type}`);
      return;
    }

    if (record.type === 'APP') {
      await this.router.navigateByUrl(`/application/${record.referenceId}`);
      return;
    }

    if (record.type === 'NOI') {
      await this.router.navigateByUrl(`/notice-of-intent/${record.referenceId}`);
      return;
    }

    this.toastService.showErrorToast(`Unable to navigate to ${record.referenceId}`);
  }

  private mapSearchResults(data: SearchResultDto[]) {
    return data.map((e) => {
      const { classType, label } = this.mapClassAndLabels(e);

      return {
        title: `${e.fileNumber} ${e.applicant ?? ''}`,
        class: classType,
        type: e.type,
        label: label,
        government: e.localGovernmentName,
        referenceId: e.referenceId,
        board: e.boardCode,
      } as SearchResult;
    });
  }

  private mapClassAndLabels(data: SearchResultDto) {
    switch (data.type) {
      case 'APP':
        return { classType: 'Application', label: data.label };
      case 'NOI':
        return { classType: 'NOI' };
      case 'COV':
        return { classType: 'Non-App', label: COVENANT_TYPE_LABEL };
      case 'PLAN':
        return { classType: 'Non-App', label: PLANNING_TYPE_LABEL };
      default:
        return { classType: 'Unknown' };
    }
  }
}
