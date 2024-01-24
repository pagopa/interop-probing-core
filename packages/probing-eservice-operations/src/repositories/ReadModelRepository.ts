import { EServiceEntity } from "./entity/eservice.entity.js";
import { ReadModelDbConfig } from "../utilities/readmodelDbConfig.js";
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
 * Type of the filter that can be used to query the read model.
 * It extends the TypeORM filter type by adding all the possible model query keys.
 * The ReadModelFilter includes optional filters for each property of the entity type T,
 * and extends FindManyOptions for additional filtering options.
 */
export type ReadModelFilter<T> = {
  [P in FilterKeys<T>]?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
} & FindManyOptions<T>;

type EServiceEntities = Repository<EServiceEntity>;
type EserviceProbingRequestEntities = Repository<EserviceProbingRequest>;
type EserviceProbingResponseEntities = Repository<EserviceProbingResponse>;

export class ReadModelRepository {
  private static instance: ReadModelRepository;
 
  private connection: DataSource;
  private entityManager: EntityManager;
  
  public eservices: EServiceEntities;
  public eservicesProbingRequest: EserviceProbingRequestEntities;
  public eservicesProbingResponse: EserviceProbingResponseEntities;

  private constructor({
    readModelDbHost: host,
    readModelDbPort: port,
    readModelDbUsername: username,
    readModelDbPassword: password,
    readModelDbName: database,
  }: ReadModelDbConfig) {
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
    this.eservicesProbingRequest = this.entityManager.getRepository(EserviceProbingRequest);
    this.eservicesProbingResponse = this.entityManager.getRepository(EserviceProbingResponse);
  }

  public static init(config: ReadModelDbConfig): ReadModelRepository {
    if (!ReadModelRepository.instance) {
      // eslint-disable-next-line functional/immutable-data
      ReadModelRepository.instance = new ReadModelRepository(config);
    }

    return ReadModelRepository.instance;
  }
}
