import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class ParcelLookup {
  @PrimaryColumn({ type: 'int4' })
  objectid: number;

  @Column({ type: 'varchar', length: 254 })
  globalUid: string;

  @Column({ type: 'varchar', length: 50 })
  parcelName: string;

  @Column({ type: 'varchar', length: 128 })
  planNumber: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pin: string;

  @Column({ type: 'varchar', length: 9, nullable: true })
  @Index()
  pid: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pidFormatted: string;

  @Column({ type: 'int4', nullable: true })
  pidNumber: string;

  @Column({ type: 'varchar', length: 50 })
  parcelClass: string;

  @Column({ type: 'varchar', length: 50 })
  ownerType: string;

  @Column({ type: 'varchar', nullable: true })
  legalDescription: string;

  @Column({ type: 'varchar', length: 254, nullable: true })
  municipality: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  regionalDistrict: string;

  @Column({ type: 'float8' })
  featureAreaSqm: string;

  @Column({ type: 'float8' })
  gisAreaHa: string;
}
