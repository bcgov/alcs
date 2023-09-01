import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private toastService: ToastService, private router: Router, private searchService: SearchService) {}

  async onSearch() {
    try {
      const searchResult = await this.searchService.fetch(this.searchText);
      if (!searchResult || searchResult.length < 1) {
        this.toastService.showWarningToast(`File ID ${this.searchText} not found, try again`);
        return;
      }

      if (searchResult?.length === 1) {
        const result = searchResult[0];
        switch (result.type) {
          case 'APP':
            await this.router.navigate(['application', result.referenceId]);
            break;
          case 'NOI':
            await this.router.navigate(['notice-of-intent', result.referenceId]);
            break;
          case 'COV':
          case 'PLAN':
            await this.router.navigateByUrl(
              `/board/${result.boardCode}?card=${result.referenceId}&type=${result.type}`
            );
            break;
          default:
            this.toastService.showErrorToast(`Unable to navigate to ${result.referenceId}`);
        }
      }

      if (searchResult?.length > 1) {
        await this.router.navigateByUrl(`/search?searchText=${this.searchText}`);
      }

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
