export interface NotificationDto {
  uuid: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  targetType: 'application';
  link: string;
}
