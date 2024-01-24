import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import {
  IsDateString,
  Length,
  IsArray,
  IsDefined,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  Min,
  IsNumber,
} from "class-validator";
import { EserviceInteropState, EserviceTechnology } from "../../model/dtos/eservice.js";
import * as moment from "moment";

@Entity({ name: "eservices" })
@Unique(["eservice_id", "version_id"])
export class EServiceEntity {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint", unsigned: true })
  eserviceRecordId!: number;

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "base_path", type: "varchar", array: true, length: 2048 })
  basePath!: string[];

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Column({ name: "eservice_name" })
  eserviceName!: string;

  @IsDefined()
  @IsString()
  @IsEnum(EserviceTechnology)
  @Column({ name: "eservice_technology" })
  technology!: EserviceTechnology;

  @IsDefined()
  @IsUUID("4")
  @Column({ name: "eservice_id" })
  eserviceId!: string;

  @IsDefined()
  @Min(1)
  @IsNumber()
  @Column({ name: "polling_frequency", default: 5 })
  pollingFrequency: number;

  @IsDefined()
  @IsDateString()
  @Column({
    name: "polling_start_time",
    type: "timestamptz",
    default: () =>
      moment
        .utc()
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toDate(),
  })
  pollingStartTime!: Date;

  @IsDefined()
  @IsDateString()
  @Column({
    name: "polling_end_time",
    type: "timestamptz",
    default: () =>
      moment
        .utc()
        .set({ hour: 23, minute: 59, second: 0, millisecond: 0 })
        .toDate(),
  })
  pollingEndTime!: Date;

  @IsDefined()
  @Column({ name: "probing_enabled", default: true })
  probingEnabled!: boolean;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Column({ name: "producer_name" })
  producerName!: string;

  @IsDefined()
  @IsEnum(EserviceInteropState)
  @Column({ name: "state" })
  state!: EserviceInteropState;

  @IsDefined()
  @IsUUID("4")
  @Column({ name: "version_id" })
  versionId!: string;

  @IsNumber()
  @Column({ name: "lock_version" })
  lockVersion!: number;

  @IsDefined()
  @Min(1)
  @IsNumber()
  @Column({ name: "version_number" })
  versionNumber!: number;

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "audience", type: "varchar", array: true, length: 2048 })
  audience!: string[];
}
