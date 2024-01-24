import { EServiceEntity } from "./entity/eservice.entity.js";
import { DbConfig } from "../utilities/dbConfig.js";
import { Repository, EntityManager, DataSource } from "typeorm";
import { FindManyOptions } from "typeorm";
import { EserviceProbingRequest } from "./entity/eservice_probing_request.entity.js";
import { EserviceProbingResponse } from "./entity/eservice_probing_response.entity.js";

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

type EServiceEntities = Repository<EServiceEntity>;
type EserviceProbingRequestEntities = Repository<EserviceProbingRequest>;
type EserviceProbingResponseEntities = Repository<EserviceProbingResponse>;

export class ModelRepository {
  private static instance: ModelRepository;

  private connection: DataSource;
  private entityManager: EntityManager;

  public eservices: EServiceEntities;
  public eservicesProbingRequest: EserviceProbingRequestEntities;
  public eservicesProbingResponse: EserviceProbingResponseEntities;

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
      entities: [EServiceEntity],
      synchronize: false,
      logging: false,
    });

    this.connection.initialize();
    this.entityManager = this.connection.createEntityManager();
    this.eservices = this.entityManager.getRepository(EServiceEntity);
    this.eservicesProbingRequest = this.entityManager.getRepository(
      EserviceProbingRequest
    );
    this.eservicesProbingResponse = this.entityManager.getRepository(
      EserviceProbingResponse
    );
  }

  public static init(config: DbConfig): ModelRepository {
    if (!ModelRepository.instance) {
      // eslint-disable-next-line functional/immutable-data
      ModelRepository.instance = new ModelRepository(config);
    }

    return ModelRepository.instance;
  }
}
