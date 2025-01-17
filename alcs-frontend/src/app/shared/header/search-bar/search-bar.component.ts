import { animate, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search/search.service';
import { ToastService } from '../../../services/toast/toast.service';
import { AuthenticationService, ROLES } from '../../../services/authentication/authentication.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  animations: [
    trigger('inAnimation', [transition(':enter', [style({ height: 0, opacity: 0 }), animate('100ms ease-out')])]),
  ],
})
export class SearchBarComponent implements AfterViewInit, OnInit {
  searchText = '';
  showInput = false;
  wasInside = false;
  @ViewChildren('searchInput') input!: QueryList<ElementRef>;

  isCommissioner = false;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private searchService: SearchService,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.isCommissioner =
          currentUser.client_roles && currentUser.client_roles.length === 1
            ? currentUser.client_roles.includes(ROLES.COMMISSIONER)
            : false;
      }
    });
  }

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickOutside() {
    if (!this.wasInside) {
      this.showInput = false;
    }
    this.wasInside = false;
  }

  ngAfterViewInit(): void {
    this.input.changes.subscribe(() => {
      this.focusInput();
    });
  }

  focusInput() {
    if (this.input.length > 0) {
      this.input.first.nativeElement.focus();
    }
  }

  selectInput() {
    if (this.input.length > 0) {
      this.input.first.nativeElement.select();
    }
  }

  toggleInput() {
    this.showInput = !this.showInput;
  }

  resetInput() {
    this.toggleInput();
    this.searchText = '';
  }

  async onSearch() {
    if (!this.searchText) {
      this.toastService.showErrorToast(`File not found, try again`);
      this.focusInput();
      return;
    }

    try {
      const searchResult = await this.searchService.fetch(this.searchText);
      if (!searchResult || searchResult.length < 1) {
        this.isCommissioner
          ? this.toastService.showWarningToast(
              `File ID ${this.searchText} not found. Enter an application ID and try again`,
            )
          : this.toastService.showWarningToast(`File ID ${this.searchText} not found, try again`);
        this.selectInput();
        return;
      }

      if (searchResult?.length === 1) {
        const result = searchResult[0];
        switch (result.type) {
          case 'APP':
            const appStatusResult = await this.searchService.advancedSearchApplicationStatusFetch([result.fileNumber]);
            let appDecisionUrl = '';
            if (appStatusResult && appStatusResult.length > 0 && appStatusResult[0].status === 'ALCD') {
              appDecisionUrl = '/decision'
            }
            this.isCommissioner
              ? await this.router.navigate(['commissioner/application', result.referenceId])
              : await this.router.navigate([`application/${result.referenceId}${appDecisionUrl}`]);
            break;
          case 'NOI':
            const noiStatusResult = await this.searchService.advancedSearchNoiStatusFetch([result.fileNumber]);
            let noiDecisionUrl = '';
            if (noiStatusResult && noiStatusResult.length > 0 && noiStatusResult[0].status === 'ALCD') {
              noiDecisionUrl = '/decision'
            }
            await this.router.navigate([`notice-of-intent/${result.referenceId}${noiDecisionUrl}`]);
            break;
          case 'NOTI':
            await this.router.navigate(['notification', result.referenceId]);
            break;
          case 'INQR':
            await this.router.navigate(['inquiry', result.referenceId]);
            break;
          case 'COV':
          case 'PLAN':
            await this.router.navigate(['planning-review', result.referenceId]);
            break;
          default:
            this.toastService.showErrorToast(`Unable to navigate to ${result.referenceId}`);
        }
      }

      if (searchResult?.length > 1) {
        await this.router.navigateByUrl(`/search?searchText=${this.searchText}`);
      }

      this.resetInput();
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.isCommissioner
          ? this.toastService.showWarningToast(
              `File ID ${this.searchText} not found. Enter an application ID and try again`,
            )
          : this.toastService.showWarningToast(`File ID ${this.searchText} not found, try again`);
        this.selectInput();
      }
    }
  }

  async navigateToAdvancedSearch() {
    let url = '/search';

    if (this.searchText) {
      url += `?searchText=${this.searchText}`;
    }

    await this.router.navigateByUrl(url);
    this.resetInput();
  }
}
