export interface MessageDto {
  uuid: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  targetType: 'application';
  link: string;
}
