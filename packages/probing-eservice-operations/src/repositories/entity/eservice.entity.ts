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
import * as moment from "moment";
import {
  EserviceInteropState,
  EserviceTechnology,
} from "pagopa-interop-probing-models";
import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

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
  @Column({ name: "eservice_name", type: "varchar" })
  eserviceName!: string;

  @IsDefined()
  @IsString()
  @IsEnum(EserviceTechnology)
  @Column({ name: "eservice_technology", type: "varchar" })
  technology!: EserviceTechnology;

  @IsDefined()
  @IsUUID("4")
  @Column({ name: "eservice_id", type: "uuid" })
  eserviceId!: string;

  @IsDefined()
  @Min(1)
  @IsNumber()
  @Column({ name: "polling_frequency", type: "int", default: 5 })
  pollingFrequency!: number;

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
  @Column({ name: "probing_enabled", type: "boolean", default: true })
  probingEnabled!: boolean;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Column({ name: "producer_name", type: "varchar" })
  producerName!: string;

  @IsDefined()
  @IsEnum(EserviceInteropState)
  @Column({ name: "state", type: "varchar" })
  state!: EserviceInteropState;

  @IsDefined()
  @IsUUID("4")
  @Column({ name: "version_id", type: "uuid" })
  versionId!: string;

  @IsNumber()
  @Column({ name: "lock_version", type: "int" })
  lockVersion!: number;

  @IsDefined()
  @Min(1)
  @IsNumber()
  @Column({ name: "version_number", type: "int" })
  versionNumber!: number;

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "audience", type: "varchar", array: true, length: 2048 })
  audience!: string[];
}
