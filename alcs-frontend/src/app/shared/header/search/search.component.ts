import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
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
    private toastService: ToastService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    const year = moment('1950');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
    this.loadGovernments();

    this.filteredLocalGovernments = this.localGovernment.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value || ''))
    );

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

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
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSelectCard(record: SearchResult) {
    switch (record.type) {
      case 'APP':
        await this.router.navigateByUrl(`/application/${record.referenceId}`);
        break;
      case 'NOI':
        await this.router.navigateByUrl(`/notice-of-intent/${record.referenceId}`);
        break;
      case 'COV':
      case 'PLAN':
        await this.router.navigateByUrl(`/board/${record.board}?card=${record.referenceId}&type=${record.type}`);
        break;
      default:
        this.toastService.showErrorToast(`Unable to navigate to ${record.referenceId}`);
    }
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
      };
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

  // new search functionality

  localGovernment = new FormControl<string | null>(null);
  createForm = new FormGroup({
    fileNumber: new FormControl(null),
    name: new FormControl(null),
    pid: new FormControl(null),
    civicAddress: new FormControl(null),
    isIncludeOtherParcels: new FormControl(false),
    resolutionNumber: new FormControl(null),
    resolutionYear: new FormControl(null),
    legacyId: new FormControl(null),
    portalStatus: new FormControl(null),
    componentType: new FormControl(null),
    government: this.localGovernment,
    region: new FormControl(null),
    dateSubmittedFrom: new FormControl(null),
    dateSubmittedTo: new FormControl(null),
    dateDecidedFrom: new FormControl(null),
    dateDecidedTo: new FormControl(null),
  });

  isSearchExpanded = true;
  resolutionYears: number[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<ApplicationLocalGovernmentDto[]>;
  regions: ApplicationRegionDto[] = [];

  onSubmit() {
    console.log('onSubmit');
  }

  expandSearchClicked() {
    this.isSearchExpanded = !this.isSearchExpanded;
  }

  private async loadGovernments() {
    const governments = await this.localGovernmentService.list();
    this.localGovernments = governments.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  private filter(value: string): ApplicationLocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  onGovernmentChange($event: MatAutocompleteSelectedEvent) {
    const localGovernmentName = $event.option.value;
    if (localGovernmentName) {
      const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
      if (localGovernment) {
        this.localGovernment.setValue(localGovernment.name);
      }
    }
  }

  onBlur() {
    //Blur will fire before onChange above, so use setTimeout to delay it
    setTimeout(() => {
      const localGovernmentName = this.localGovernment.getRawValue();
      if (localGovernmentName) {
        const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
        if (!localGovernment) {
          this.localGovernment.setValue(null);
          console.log('Clearing Local Government field');
        }
      }
    }, 500);
  }

  onReset() {
    console.log('onReset');
  }

  onSearch() {
    console.log('onSearch');
  }
}
