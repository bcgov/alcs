import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { TagCategoryDialogComponent } from './tag-category-dialog/tag-category-dialog.component';
import { TagCategoryService } from '../../../services/tag/tag-category/tag-category.service';
import { TagCategoryDto } from '../../../services/tag/tag-category/tag-category.dto';
import { PageEvent } from '@angular/material/paginator';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-tag-category',
  templateUrl: './tag-category.component.html',
  styleUrls: ['./tag-category.component.scss'],
})
export class TagCategoryComponent implements OnInit {
  destroy = new Subject<void>();
  pageIndex = 0;
  itemsPerPage = 20;
  search?: string = undefined;
  categories: TagCategoryDto[] = [];
  total: number = 0;
  displayedColumns: string[] = ['name', 'actions'];
  filteredOptions: string[] = [];

  constructor(
    private tagCategoryService: TagCategoryService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetch();

    this.tagCategoryService.$categories
      .pipe(takeUntil(this.destroy))
      .subscribe((result: { data: TagCategoryDto[]; total: number }) => {
        this.categories = result.data;
        this.filteredOptions = [];
        this.total = result.total;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.fetch();
  }

  async fetch() {
    this.tagCategoryService.fetch(this.pageIndex, this.itemsPerPage, this.search);
  }

  async onCreate() {
    const dialog = this.dialog.open(TagCategoryDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onEdit(categoryDto: TagCategoryDto) {
    const dialog = this.dialog.open(TagCategoryDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: categoryDto,
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(categoryDto: TagCategoryDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${categoryDto.name}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          try {
            await this.tagCategoryService.delete(categoryDto.uuid);
          } catch (e) {
            this.handleError(e);
          }
          await this.fetch();
        }
      });
  }

  async updateFilter(value: string) {
    const response = await this.tagCategoryService.search(0, 5, value);
    if (response) {
      this.filteredOptions = response.data.map((res) => res.name);
    }
  }

  private handleError(e: any) {
    const res = e as HttpErrorResponse;
    if (res.error.statusCode === HttpStatusCode.Conflict && res.error.message.includes('update or delete on table')) {
      this.toastService.showErrorToast('Category is associated with tags. Unable to delete.');
    } else {
      throw e;
    }
  }
}
