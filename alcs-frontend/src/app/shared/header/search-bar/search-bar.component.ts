import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search/search.service';
import { ToastService } from '../../../services/toast/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  animations: [
    trigger('inAnimation', [transition(':enter', [style({ height: 0, opacity: 0 }), animate('100ms ease-out')])]),
  ],
})
export class SearchBarComponent {
  searchText = '';
  showInput = false;
  wasInside = false;
  @ViewChild('searchInput') input!: ElementRef;

  constructor(private toastService: ToastService, private router: Router, private searchService: SearchService) {}

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

  async toggleInput() {
    this.showInput = !this.showInput;
  }

  async onSearch() {
    if (!this.searchText) {
      this.toastService.showErrorToast(`File not found, try again`);
      return;
    }

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
        this.toggleInput();
      }

      if (searchResult?.length > 1) {
        await this.router.navigateByUrl(`/search?searchText=${this.searchText}`);
        this.toggleInput();
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
