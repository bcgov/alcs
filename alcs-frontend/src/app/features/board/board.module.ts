import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule, Routes } from '@angular/router';
import { MentionModule } from 'angular-mentions';
import { CardComponent } from '../../shared/card/card.component';
import { CommentComponent } from '../../shared/commenting/comment.component';
import { CommentsComponent } from '../../shared/commenting/comments.component';
import { DragDropBoardComponent } from '../../shared/drag-drop-board/drag-drop-board.component';
import { StatusFilterPipe } from '../../shared/drag-drop-board/status-filter.pipe';
import { MentionTextareaComponent } from '../../shared/mention-textarea/mention-textarea.component';
import { SharedModule } from '../../shared/shared.module';
import { BoardComponent } from './board.component';
import { AmendmentDialogComponent } from './dialogs/amendment/amendment-dialog.component';
import { CreateAmendmentDialogComponent } from './dialogs/amendment/create/create-amendment-dialog.component';
import { ApplicationDialogComponent } from './dialogs/application/application-dialog.component';
import { CreateApplicationDialogComponent } from './dialogs/application/create/create-application-dialog.component';
import { CovenantDialogComponent } from './dialogs/covenant/covenant-dialog.component';
import { CreateCovenantDialogComponent } from './dialogs/covenant/create/create-covenant-dialog.component';
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
    CreateAmendmentDialogComponent,
    AmendmentDialogComponent,
    CovenantDialogComponent,
    CreateCovenantDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    DragDropModule,
    MatGridListModule,
    RouterModule.forChild(routes),
    MentionModule,
  ],
})
export class BoardModule {}
