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
import {
  EserviceInteropState,
  EserviceTechnology,
  EserviceStatus,
} from "../../../dtos/eservice.js";

@Entity({ name: "eservice_view" })
export class EserviceView {
  @PrimaryGeneratedColumn({ name: "id" })
  eserviceRecordId: number;

  @IsString()
  @Length(1, 255)
  @Column({ name: "eservice_name" })
  eserviceName: string;

  @Column({ name: "eservice_id" })
  eserviceId: string;

  @IsString()
  @Length(1, 255)
  @Column({ name: "producer_name" })
  producerName: string;

  @IsBoolean()
  @Column({ name: "probing_enabled" })
  probingEnabled: boolean;

  @IsEnum(EserviceInteropState)
  @Column({ name: "state" })
  state: EserviceInteropState;

  @IsUUID("4")
  @Column({ name: "version_id" })
  versionId: string;

  @IsNumber()
  @Column({ name: "version_number" })
  versionNumber: number;

  @IsDateString()
  @Column({ name: "response_received", type: "timestamptz" })
  responseReceived: Date;

  @IsDateString()
  @Column({ name: "last_request", type: "timestamptz" })
  lastRequest: Date;

  @IsNumber()
  @Column({ name: "polling_frequency" })
  pollingFrequency: number;

  @IsDateString()
  @Column({ name: "polling_start_time" })
  pollingStartTime: Date;

  @IsDateString()
  @Column({ name: "polling_end_time" })
  pollingEndTime: Date;

  @IsEnum(EserviceTechnology)
  @Column({ name: "technology" })
  technology: EserviceTechnology;

  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "base_path", type: "varchar", array: true, length: 2048 })
  basePath!: string[];

  @IsEnum(EserviceStatus)
  @Column({ name: "status" })
  responseStatus: EserviceStatus;

  @IsArray()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Column({ name: "audience", type: "varchar", array: true, length: 2048 })
  audience!: string[];
}
