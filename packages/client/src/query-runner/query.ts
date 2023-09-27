import { executeQuery, executeRawQuery } from '@auro-orm/core';
import { QueryBuilder } from '../query-builder/builder';
import {
  DeleteManyParams,
  DeleteOneParams,
  FindManyParams,
  FindUniqueParams,
  InsertOneParams,
  InsertManyParams,
  UpdateManyParams,
  UpdateOneParams,
  AggregateParams,
} from '..';

export class Query<T> {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  static async raw<T>(query: string): Promise<T | null> {
    const jsonEntity = await executeRawQuery(query);
    return jsonEntity ? (JSON.parse(jsonEntity) as T) : null;
  }

  async insertOne<K extends keyof T>(params: InsertOneParams<T>): Promise<Pick<T, K> | null> {
    const jsonEntity = await this.query('insertone', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T> | null) => (entity ? entity[0] : null));
  }

  async insertMany<K extends keyof T>(params: InsertManyParams<T>): Promise<Array<Pick<T, K>> | null> {
    const jsonEntity = await this.query('insertmany', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity : null));
  }

  async findUnique<K extends keyof T>(params: FindUniqueParams<T, K>): Promise<Pick<T, K> | null> {
    const jsonEntity = await this.query('findfirst', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity[0] : null));
  }

  async findMany<K extends keyof T>(params?: FindManyParams<T, K>): Promise<Array<Pick<T, K>> | null> {
    const jsonEntity = await this.query('findmany', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<Pick<T, K>> | null) => entity);
  }

  async deleteOne<K extends keyof T>(params: DeleteOneParams<T>): Promise<Pick<T, K> | undefined | null> {
    const jsonEntity = await this.query('deleteone', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity[0] : null));
  }

  async deleteMany<K extends keyof T>(params: DeleteManyParams<T>): Promise<Array<Pick<T, K>> | undefined | null> {
    const jsonEntity = await this.query('deletemany', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity : null));
  }

  async updateOne<K extends keyof T>(params: UpdateOneParams<T>): Promise<Pick<T, K> | null> {
    const jsonEntity = await this.query('updateone', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity[0] : null));
  }

  async updateMany<K extends keyof T>(params: UpdateManyParams<T>): Promise<Array<Pick<T, K>> | undefined | null> {
    const jsonEntity = await this.query('updatemany', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity : null));
  }

  async aggregate<T>(params: AggregateParams<T>): Promise<T | null> {
    const jsonEntity = params.avg ? await this.query('average', params) : await this.query('count', params);
    return this.parseAndTransform(jsonEntity, (entity: Array<T>) => (entity ? entity[0] : null));
  }

  private async query(operation: string, params: any): Promise<string | null> {
    const queryBuilder = new QueryBuilder(this.name, operation);
    const { metadata, fields, options } = queryBuilder.fill(params).build();
    return await executeQuery(fields, options, metadata);
  }

  private async parseAndTransform<T, U>(jsonEntity: string | null, transform: (entity: T) => U): Promise<U | null> {
    if (jsonEntity === null || jsonEntity.length === 0 || !jsonEntity.trim()) {
      return null;
    }
    console.log(jsonEntity);
    const entity = JSON.parse(jsonEntity);

    return Array.isArray(entity) && entity.length === 0 ? null : transform(entity);
  }
}
