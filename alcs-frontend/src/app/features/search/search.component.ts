import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../services/application/application.service';
import { SearchRequestDto, SearchResultDto } from '../../services/search/search.dto';
import { SearchService } from '../../services/search/search.service';
import { ToastService } from '../../services/toast/toast.service';
import {
  COVENANT_TYPE_LABEL,
  PLANNING_TYPE_LABEL,
} from '../../shared/application-type-pill/application-type-pill.constants';
import { formatDateForApi } from '../../shared/utils/api-date-formatter';

interface SearchResult {
  fileNumber: string;
  dateSubmitted: number;
  ownerName: string;
  type?: any;
  government?: string;
  portalStatus?: string;
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
  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'portalStatus'];

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
      map((value) => this.filterLocalGovernment(value || ''))
    );

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

    this.activatedRoute.queryParamMap.pipe(takeUntil(this.$destroy)).subscribe((queryParamMap) => {
      const searchText = queryParamMap.get('searchText');

      if (searchText) {
        this.searchText = searchText;

        this.searchService
          .fetch({ fileNumber: searchText, isIncludeOtherParcels: false })
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
        fileNumber: e.fileNumber,
        dateSubmitted: e.dateSubmitted,
        ownerName: e.ownerName,
        type: e.type,
        label: label,
        government: e.localGovernmentName,
        portalStatus: e.portalStatus,
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

  localGovernment = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl(undefined),
    name: new FormControl(undefined),
    pid: new FormControl(undefined),
    civicAddress: new FormControl(undefined),
    isIncludeOtherParcels: new FormControl(false),
    resolutionNumber: new FormControl<string | undefined>(undefined),
    resolutionYear: new FormControl<number | undefined>(undefined),
    legacyId: new FormControl(undefined),
    portalStatus: new FormControl(undefined),
    componentType: new FormControl(undefined),
    government: this.localGovernment,
    region: new FormControl(undefined),
    dateSubmittedFrom: new FormControl(undefined),
    dateSubmittedTo: new FormControl(undefined),
    dateDecidedFrom: new FormControl(undefined),
    dateDecidedTo: new FormControl(undefined),
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

  private filterLocalGovernment(value: string): ApplicationLocalGovernmentDto[] {
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
    this.searchForm.reset();
  }

  async onSearch() {
    const searchParams = this.getSearchParams();
    this.searchResults = (await this.searchService.fetch(searchParams)) ?? [];
  }

  getSearchParams() {
    return {
      // TODO move condition into helper function
      fileNumber:
        this.searchForm.controls.fileNumber.value && this.searchForm.controls.fileNumber.value !== ''
          ? this.searchForm.controls.fileNumber.value
          : undefined,
      legacyId: this.searchForm.controls.legacyId.value ?? undefined,
      name: this.searchForm.controls.name.value ?? undefined,
      civicAddress: this.searchForm.controls.civicAddress.value ?? undefined,
      pid: this.searchForm.controls.pid.value ?? undefined,
      isIncludeOtherParcels: this.searchForm.controls.isIncludeOtherParcels.value ?? false,
      resolutionNumber: this.searchForm.controls.resolutionNumber.value
        ? parseInt(this.searchForm.controls.resolutionNumber.value)
        : undefined,
      resolutionYear: this.searchForm.controls.resolutionYear.value ?? undefined,
      portalStatusCode: this.searchForm.controls.portalStatus.value ?? undefined,
      governmentName: this.searchForm.controls.government.value ?? undefined,
      regionCode: this.searchForm.controls.region.value ?? undefined,
      dateSubmittedFrom: this.searchForm.controls.dateSubmittedFrom.value
        ? formatDateForApi(this.searchForm.controls.dateSubmittedFrom.value)
        : undefined,
      dateSubmittedTo: this.searchForm.controls.dateSubmittedTo.value
        ? formatDateForApi(this.searchForm.controls.dateSubmittedTo.value)
        : undefined,
      dateDecidedFrom: this.searchForm.controls.dateDecidedFrom.value
        ? formatDateForApi(this.searchForm.controls.dateDecidedFrom.value)
        : undefined,
      dateDecidedTo: this.searchForm.controls.dateDecidedTo.value
        ? formatDateForApi(this.searchForm.controls.dateDecidedTo.value)
        : undefined,
    } as SearchRequestDto;
  }
}
