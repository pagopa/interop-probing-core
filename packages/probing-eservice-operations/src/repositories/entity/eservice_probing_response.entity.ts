import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { IsEnum, IsDefined } from "class-validator";
import { EServiceEntity } from "./eservice.entity.js";
import { EserviceStatus } from "pagopa-interop-probing-models";

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

  @OneToOne(() => EServiceEntity, { lazy: true })
  @JoinColumn({ name: "eservices_record_id" })
  eservice: EServiceEntity;
}
