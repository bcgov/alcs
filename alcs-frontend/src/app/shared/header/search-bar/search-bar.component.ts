import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService } from '../../../services/application/application.service';
import { SearchService } from '../../../services/search/search.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  searchText = '';
  @ViewChild('searchInput') input!: ElementRef;

  constructor(
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private router: Router,
    private searchService: SearchService
  ) {}

  async onSearch() {
    try {
      const searchResult = await this.searchService.fetch(this.searchText);
      if (!searchResult || searchResult.length < 1) {
        this.toastService.showWarningToast(`File ID ${this.searchText} not found, try again`);
        return;
      }

      if (searchResult?.length === 1) {
        const result = searchResult[0];
        if (result.type === 'APP') {
          await this.router.navigate(['application', result.referenceId]);
        }

        if (result.type === 'NOI') {
          await this.router.navigate(['notice-of-intent', result.referenceId]);
        }

        if (['COV', 'PLAN'].includes(result.type)) {
          this.toastService.showErrorToast('Not implemented');
        }
      }

      if (searchResult?.length > 1) {
        await this.router.navigateByUrl(`/search?searchText=${this.searchText}`);
      }

      // const app = await this.applicationService.fetchApplication(this.searchText);

      this.searchText = '';
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.toastService.showWarningToast(`File ID ${this.searchText} not found, try again`);
        const inputElem = <HTMLInputElement>this.input.nativeElement;
        inputElem.select();
      }
    }
  }
}
