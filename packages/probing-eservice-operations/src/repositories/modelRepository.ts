import { DbConfig } from "../utilities/dbConfig.js";
import { Repository, EntityManager, DataSource } from "typeorm";
import { FindManyOptions } from "typeorm";
import {
  EserviceProbingRequest,
  EserviceProbingRequestSchema,
} from "./entity/eservice_probing_request.entity.js";
import {
  EserviceProbingResponse,
  EserviceProbingResponseSchema,
} from "./entity/eservice_probing_response.entity.js";
import {
  EserviceView,
  EserviceViewSchema,
} from "./entity/view/eservice.entity.js";
import {
  Eservice,
  EserviceSchema,
  Tenant,
  TenantSchema,
} from "./entity/eservice.entity.js";
import { genericLogger } from "pagopa-interop-probing-commons";

/**
 * Extracts keys of a given type T
 */
type FilterKeys<T> = keyof T;

/**
 * Extracts keys of a given TypeORM entity type T
 */
export type TypeORMQueryKeys<T> = keyof T;

/**
 * Type of the filter that can be used to query the model.
 * It extends the TypeORM filter type by adding all the possible model query keys.
 * The ModelFilter includes optional filters for each property of the entity type T,
 * and extends FindManyOptions for additional filtering options.
 */
export type ModelFilter<T> = {
  [P in FilterKeys<T>]?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
} & FindManyOptions<T>;

export type EserviceEntities = Repository<EserviceSchema>;
export type TenantEntities = Repository<TenantSchema>;
export type EserviceProbingRequestEntities =
  Repository<EserviceProbingRequestSchema>;
export type EserviceProbingResponseEntities =
  Repository<EserviceProbingResponseSchema>;
export type EserviceViewEntities = Repository<EserviceViewSchema>;

export class ModelRepository {
  private static instance: ModelRepository;

  private connection: DataSource;
  private entityManager: EntityManager;

  public eservices: EserviceEntities;
  public eserviceProbingRequest: EserviceProbingRequestEntities;
  public eserviceProbingResponse: EserviceProbingResponseEntities;
  public eserviceView: EserviceViewEntities;
  public tenants: TenantEntities;

  private constructor({
    dbHost: host,
    dbPort: port,
    dbUsername: username,
    dbPassword: password,
    dbName: database,
  }: DbConfig) {
    this.connection = new DataSource({
      type: "postgres",
      name: "probing-eservice-operations",
      host,
      port,
      username,
      password,
      database,
      entities: [
        Eservice,
        EserviceProbingRequest,
        EserviceProbingResponse,
        EserviceView,
        Tenant,
      ],
      migrationsRun: false,
      synchronize: false,
      logging: false,
    });

    this.entityManager = this.connection.createEntityManager();
    this.eservices = this.entityManager.getRepository(Eservice);
    this.tenants = this.entityManager.getRepository(Tenant);
    this.eserviceProbingRequest = this.entityManager.getRepository(
      EserviceProbingRequest,
    );
    this.eserviceProbingResponse = this.entityManager.getRepository(
      EserviceProbingResponse,
    );
    this.eserviceView = this.entityManager.getRepository(EserviceView);
  }

  public static async init(
    config: DbConfig,
    initDB: string | null = null,
  ): Promise<ModelRepository> {
    if (!ModelRepository.instance) {
      ModelRepository.instance = new ModelRepository(config);
      const connectionStatus =
        await ModelRepository.instance.connection.initialize();
      if (initDB) {
        await ModelRepository.instance.entityManager.query(initDB);
      }
      genericLogger.info(
        `Database Connection Status: ${
          connectionStatus ? "Initialized" : "Not Initialized"
        }`,
      );
    }

    return ModelRepository.instance;
  }
}
