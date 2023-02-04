import { AutoMap } from '@automapper/classes';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HolidayEntity extends BaseEntity {
  constructor(data?: Partial<HolidayEntity>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap({})
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap({})
  @Column()
  name: string;

  @AutoMap()
  @Column({
    type: 'date',
    unique: true,
  })
  day: Date;
}
