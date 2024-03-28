import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { RouterModule, Routes } from '@angular/router';
import { MentionModule } from 'angular-mentions';
import { NgxMaskDirective } from 'ngx-mask';
import { CardComponent } from '../../shared/card/card.component';
import { CommentComponent } from '../../shared/commenting/comment.component';
import { CommentsComponent } from '../../shared/commenting/comments.component';
import { DragDropBoardComponent } from '../../shared/drag-drop-board/drag-drop-board.component';
import { StatusFilterPipe } from '../../shared/drag-drop-board/status-filter.pipe';
import { MentionTextareaComponent } from '../../shared/mention-textarea/mention-textarea.component';
import { SharedModule } from '../../shared/shared.module';
import { BoardComponent } from './board.component';
import { CardDialogComponent } from './dialogs/card-dialog/card-dialog.component';
import { AppModificationDialogComponent } from './dialogs/app-modification/app-modification-dialog.component';
import { CreateAppModificationDialogComponent } from './dialogs/app-modification/create/create-app-modification-dialog.component';
import { ApplicationDialogComponent } from './dialogs/application/application-dialog.component';
import { CreateApplicationDialogComponent } from './dialogs/application/create/create-application-dialog.component';
import { CreateInquiryDialogComponent } from './dialogs/inquiry/create/create-inquiry-dialog.component';
import { InquiryDialogComponent } from './dialogs/inquiry/inquiry-dialog.component';
import { CreateNoiModificationDialogComponent } from './dialogs/noi-modification/create/create-noi-modification-dialog.component';
import { NoiModificationDialogComponent } from './dialogs/noi-modification/noi-modification-dialog.component';
import { CreateNoticeOfIntentDialogComponent } from './dialogs/notice-of-intent/create/create-notice-of-intent-dialog.component';
import { NoticeOfIntentDialogComponent } from './dialogs/notice-of-intent/notice-of-intent-dialog.component';
import { NotificationDialogComponent } from './dialogs/notification/notification-dialog.component';
import { CreatePlanningReviewDialogComponent } from './dialogs/planning-review/create/create-planning-review-dialog.component';
import { PlanningReviewDialogComponent } from './dialogs/planning-review/planning-review-dialog.component';
import { CreateReconsiderationDialogComponent } from './dialogs/reconsiderations/create/create-reconsideration-dialog.component';
import { ReconsiderationDialogComponent } from './dialogs/reconsiderations/reconsideration-dialog.component';
import { SubtasksComponent } from './subtasks/subtasks.component';

const routes: Routes = [
  {
    path: ':boardCode',
    component: BoardComponent,
  },
];

@NgModule({
  declarations: [
    BoardComponent,
    CardDialogComponent,
    DragDropBoardComponent,
    StatusFilterPipe,
    ApplicationDialogComponent,
    CreateApplicationDialogComponent,
    CardComponent,
    CommentComponent,
    CommentsComponent,
    MentionTextareaComponent,
    SubtasksComponent,
    CreateReconsiderationDialogComponent,
    ReconsiderationDialogComponent,
    CreatePlanningReviewDialogComponent,
    PlanningReviewDialogComponent,
    CreateAppModificationDialogComponent,
    AppModificationDialogComponent,
    NoticeOfIntentDialogComponent,
    CreateNoticeOfIntentDialogComponent,
    CreateNoiModificationDialogComponent,
    NoiModificationDialogComponent,
    NotificationDialogComponent,
    InquiryDialogComponent,
    CreateInquiryDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    DragDropModule,
    MatGridListModule,
    RouterModule.forChild(routes),
    MentionModule,
    NgIf,
    MatInputModule,
    NgxMaskDirective,
  ],
})
export class BoardModule {}
