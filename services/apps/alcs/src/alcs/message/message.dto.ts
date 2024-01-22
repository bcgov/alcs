import { User } from '../../user/user.entity';

export class MessageDto {
  uuid: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  targetType: 'application';
  link: string;
}

export class CreateMessageServiceDto {
  actor: User;
  receiverUuid: string;
  body: string;
  title: string;
  link: string;
  targetType: string;
}
