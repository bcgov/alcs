import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

export enum CONFIG_VALUE {
  PORTAL_MAINTENANCE_MODE = 'portal_maintenance_mode',
  APP_MAINTENANCE_BANNER = 'app_maintenance_banner',
  APP_MAINTENANCE_BANNER_MESSAGE = 'app_maintenance_banner_message',
}

@Entity({ comment: 'Stores real time config values editable by ALCS Admin.' })
export class Configuration extends BaseEntity {
  constructor(data?: Partial<Configuration>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @PrimaryColumn()
  name: string;

  @Column({
    nullable: false,
  })
  value: string;
}
