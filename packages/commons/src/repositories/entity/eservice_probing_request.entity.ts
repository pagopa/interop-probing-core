import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { IsDefined } from "class-validator";
import { Eservice } from "./eservice.entity.js";

@Entity({ name: "eservice_probing_requests" })
export class EserviceProbingRequest {
  @PrimaryGeneratedColumn()
  eserviceRecordId!: number;

  @IsDefined()
  @Column({ name: "last_request", type: "timestamptz" })
  lastRequest!: Date;

  @OneToOne(() => Eservice, { lazy: true })
  @JoinColumn({ name: "eservices_record_id" })
  eservice!: Eservice;
}
