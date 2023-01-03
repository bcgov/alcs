import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
// Imported Parcel Data provided by PMBC
export class ParcelLookup {
  @PrimaryColumn({ type: 'int4' })
  ogcFid: number;

  @Column({ type: 'numeric', precision: 10, scale: 0 })
  parcelFab: number;

  @Column({ type: 'varchar', length: 254 })
  globalUid: string;

  @Column({ type: 'varchar', length: 50 })
  parcelNam: string;

  @Column({ type: 'numeric', precision: 10, scale: 0 })
  planId: number;

  @Column({ type: 'varchar', length: 128 })
  planNumbe: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 0,
    comment: 'Pin of 0 means it has no Pin',
  })
  pin: string;

  @Column({ type: 'varchar', length: 9, nullable: true })
  pid: string;

  @Column({ type: 'varchar', length: 254, nullable: true })
  pidFormat: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 0,
    comment: '0 means it does not exist',
  })
  pidNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sourcePar: string;

  @Column({ type: 'varchar', length: 20 })
  parcelSta: string;

  @Column({ type: 'varchar', length: 50 })
  parcelCla: string;

  @Column({ type: 'varchar', length: 50 })
  ownerType: string;

  @Column({ type: 'date', name: 'parcel_s_1', nullable: true })
  parcelS1: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  surveyDes: string;

  @Column({ type: 'varchar', length: 30, name: 'survey_d_1', nullable: true })
  surveyD1: string;

  @Column({ type: 'varchar', length: 30, name: 'survey_d_2', nullable: true })
  surveyD2: string;

  @Column({ type: 'varchar', length: 254, nullable: true })
  legalDesc: string;

  @Column({ type: 'varchar', length: 254 })
  municipali: string;

  @Column({ type: 'varchar', length: 50 })
  regionalD: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  isRemaind: string;

  @Column({ type: 'varchar', length: 50 })
  geometryS: string;

  @Column({ type: 'numeric', precision: 19, scale: 11 })
  positional: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  errorRepo: string;

  @Column({ type: 'varchar', length: 50 })
  captureMe: string;

  @Column({ type: 'varchar', length: 5 })
  compiledI: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stated_are: string;

  @Column({ type: 'date' })
  whenCreat: string;

  @Column({ type: 'date' })
  whenUpdat: string;

  @Column({ type: 'numeric', precision: 19, scale: 11 })
  featureAr: string;

  @Column({ type: 'numeric', precision: 19, scale: 11 })
  featureLe: string;

  @Column({ type: 'numeric', precision: 19, scale: 11 })
  gisAreaH: string;
}
