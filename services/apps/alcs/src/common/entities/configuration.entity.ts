import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

export enum CONFIG_VALUE {
  PORTAL_MAINTENANCE_MODE = 'portal_maintenance_mode',
  APP_MAINTENANCE_BANNER = 'app_maintenance_banner',
}

@Entity()
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
