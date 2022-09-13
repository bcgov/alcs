import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  searchText = '';
  @ViewChild('searchInput') input!: ElementRef;

  constructor(
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async onSearch() {
    const app = await this.applicationService.fetchApplication(this.searchText);
    if (app) {
      await this.router.navigate(['application', app.fileNumber]);
      this.searchText = '';
    } else {
      this.toastService.showWarningToast(`File ID ${this.searchText} not found, try again`);
      const inputElem = <HTMLInputElement>this.input.nativeElement;
      inputElem.select();
    }
  }
}
