import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HolidayEntity extends BaseEntity {
  constructor(data?: Partial<HolidayEntity>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier that is safe to share.',
  })
  uuid: string;

  @Column({
    comment: 'Unique name of the stat holiday.',
  })
  name: string;

  @Column({
    type: 'date',
    unique: true,
    comment:
      'Unique date that is considered as a holiday and will be skipped in the business days calculation process.',
  })
  day: Date;
}
