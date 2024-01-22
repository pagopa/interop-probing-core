import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { IsEnum, IsDefined } from "class-validator";
import { Eservice } from "./eservice.entity.js";
import { EserviceStatus } from "../../dtos/eservice.js";

@Entity({ name: "eservice_probing_responses" })
export class EserviceProbingResponse {
  @PrimaryGeneratedColumn()
  eserviceRecordId!: number;

  @IsDefined()
  @Column({ name: "response_received", type: "timestamptz" })
  responseReceived!: Date;

  @IsDefined()
  @IsEnum(EserviceStatus)
  @Column({ name: "status" })
  responseStatus!: EserviceStatus;

  @OneToOne(() => Eservice, { lazy: true })
  @JoinColumn({ name: "eservices_record_id" })
  eservice: Eservice;
}
