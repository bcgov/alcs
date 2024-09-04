import { CardType } from '../../shared/card/card.component';
import { AssigneeDto } from '../user/user.dto';

export type IncomingFileDto = {
  fileNumber: string;
  applicant: string;
  boardCode: string;
  assignee: AssigneeDto | null;
  type: CardType;
  highPriority: boolean;
  activeDays: number;
};

export type IncomingFileBoardMapDto = Record<string, IncomingFileDto[]>;
