import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import {
  IsBoolean,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  Length,
  IsUUID,
} from "class-validator";
import { EserviceInteropState, EserviceTechnology, EserviceStatus } from "pagopa-interop-probing-models";

@Entity({ name: "eservice_view" })
export class EserviceView {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint", unsigned: true })
  eserviceRecordId!: number;

  @IsString()
  @Length(1, 255)
  @Column({ name: "eservice_name", type: "varchar" })
  eserviceName!: string;

  @Column({ name: "eservice_id", type: "varchar" })
  eserviceId!: string;

  @IsString()
  @Length(1, 255)
  @Column({ name: "producer_name", type: "varchar" })
  producerName!: string;

  @IsBoolean()
  @Column({ name: "probing_enabled", type: "boolean" })
  probingEnabled!: boolean;

  @IsEnum(EserviceInteropState)
  @Column({ name: "state", type: "varchar" })
  state!: EserviceInteropState;

  @IsUUID("4")
  @Column({ name: "version_id", type: "uuid" })
  versionId!: string;

  @IsNumber()
  @Column({ name: "version_number", type: "int" })
  versionNumber!: number;

  @IsDateString()
  @Column({ name: "response_received", type: "timestamptz" })
  responseReceived!: Date;

  @IsDateString()
  @Column({ name: "last_request", type: "timestamptz" })
  lastRequest!: Date;

  @IsNumber()
  @Column({ name: "polling_frequency", type: "int" })
  pollingFrequency!: number;

  @IsDateString()
  @Column({ name: "polling_start_time", type: "timestamptz" })
  pollingStartTime!: Date;

  @IsDateString()
  @Column({ name: "polling_end_time", type: "timestamptz" })
  pollingEndTime!: Date;

  @IsEnum(EserviceTechnology)
  @Column({ name: "technology", type: "varchar" })
  technology!: EserviceTechnology;

  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "base_path", type: "varchar", array: true, length: 2048 })
  basePath!: string[];

  @IsEnum(EserviceStatus)
  @Column({ name: "status", type: "varchar" })
  responseStatus!: EserviceStatus;

  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "audience", type: "varchar", array: true, length: 2048 })
  audience!: string[];
}
