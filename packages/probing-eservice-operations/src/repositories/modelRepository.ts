import { EServiceEntity } from "./entity/eservice.entity.js";
import { DbConfig } from "../utilities/dbConfig.js";
import { Repository, EntityManager, DataSource } from "typeorm";
import { FindManyOptions } from "typeorm";
import { EserviceProbingRequest } from "./entity/eservice_probing_request.entity.js";
import { EserviceProbingResponse } from "./entity/eservice_probing_response.entity.js";
import { EserviceView } from "./entity/view/eservice.entity.js";

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
type EserviceViewEntities = Repository<EserviceView>;

export class ModelRepository {
  private static instance: ModelRepository;

  private connection: DataSource;
  private entityManager: EntityManager;

  public eservices: EServiceEntities;
  public eserviceProbingRequest: EserviceProbingRequestEntities;
  public eserviceProbingResponse: EserviceProbingResponseEntities;
  public eserviceView: EserviceViewEntities;

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
    this.eserviceProbingRequest = this.entityManager.getRepository(
      EserviceProbingRequest
    );
    this.eserviceProbingResponse = this.entityManager.getRepository(
      EserviceProbingResponse
    );
    this.eserviceView = this.entityManager.getRepository(EserviceView);
  }

  public static init(config: DbConfig): ModelRepository {
    if (!ModelRepository.instance) {
      // eslint-disable-next-line functional/immutable-data
      ModelRepository.instance = new ModelRepository(config);
    }

    return ModelRepository.instance;
  }
}
