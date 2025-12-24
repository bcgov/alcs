import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { TagDialogComponent } from './tag-dialog/tag-dialog.component';
import { TagService } from '../../../services/tag/tag.service';
import { TagDto } from '../../../services/tag/tag.dto';
import { PageEvent } from '@angular/material/paginator';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
    selector: 'app-tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.scss'],
    standalone: false
})
export class TagComponent implements OnInit {
  destroy = new Subject<void>();
  pageIndex = 0;
  itemsPerPage = 20;
  search?: string = undefined;
  tags: TagDto[] = [];
  total: number = 0;
  displayedColumns: string[] = ['name', 'category', 'isActive', 'actions'];
  filteredOptions: string[] = [];

  constructor(
    private tagService: TagService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetch();

    this.tagService.$tags
      .pipe(takeUntil(this.destroy))
      .subscribe((result: { data: TagDto[]; total: number }) => {
        this.tags = result.data;
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
    this.tagService.fetch(this.pageIndex, this.itemsPerPage, this.search);
  }

  async onCreate() {
    const dialog = this.dialog.open(TagDialogComponent, {
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

  async onEdit(tagDto: TagDto) {
    const dialog = this.dialog.open(TagDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: tagDto,
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(tagDto: TagDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${tagDto.name}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          try {
            await this.tagService.delete(tagDto.uuid);
          } catch (e) {
            this.toastService.showErrorToast('Tag is associated with files. Unable to delete.');
          }
          await this.fetch();
        }
      });
  }

  async updateFilter(value: string) {
    const response = await this.tagService.search(0, 5, value);
    if (response) {
      this.filteredOptions = response.data.map((res) => res.name);
    }
  }
}
