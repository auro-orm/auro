import { Argument, Field, Metadata, Options, Order } from '@auro-orm/core/src';
import { JoinDefinition, ParamsField, QueryBuilderParams } from './types';
import { Joins, SCHEMA } from '../index';

export class QueryBuilder<T> {
  private table: string;
  private operation: string;
  private fields: Field[] = [];
  private options = {} as Options;

  constructor(table: string, operation: string) {
    this.table = table;
    this.operation = operation;
  }

  fill(params: QueryBuilderParams<T>): this {
    if (typeof params === 'undefined') {
      params = {} as QueryBuilderParams<T>;
    }

    if (params.where) {
      this.where(params);
    }

    if (params.select) {
      this.select(params);
    }

    if (params.data) {
      this.data(params);
    }

    if (params.return) {
      this.isReturnObject(params.return) ? this.return(params) : params.return && this.noreturn();
    }

    if (!params.return) {
      this.noreturn();
    }

    if (params.take) {
      this.limit(params.take);
    }

    if (params.skip) {
      this.offset(params.skip);
    }

    if (params.orderBy) {
      this.orderBy(params.orderBy);
    }

    if (params.avg) {
      this.aggregate(params.avg);
    }

    if (params.include) {
      this.include(params.include);
    }

    if (params.groupBy) {
      this.groupBy(params.groupBy);
    }

    return this;
  }

  build(): { metadata: Metadata; fields: Field[]; options: Options } {
    const metadata = {
      command: this.operation,
      table: this.table,
      schema: SCHEMA,
    };

    return { metadata, fields: this.fields, options: this.options };
  }

  private include(params: ParamsField) {
    const joiningTables = Object.keys(params);

    this.fields.push({ name: 'include', arguments: [] });
    this.selectIncluded(this.getNestedKeys(params));
    this.join(joiningTables);
  }

  private groupBy(params: string[]) {
    this.options.groupBy = params;
  }

  private aggregate(params: ParamsField) {
    this.fields.push({ name: 'aggs', arguments: this.arguments(params) });
  }

  private noreturn() {
    this.fields.push({ name: 'no_return', arguments: [] });
  }

  private where(params: ParamsField) {
    this.fields.push({
      name: 'where',
      arguments: this.arguments(params.where),
    });
  }

  private select(params: ParamsField) {
    this.fields.push({
      name: 'select',
      arguments: this.arguments(params.select),
    });
  }

  private data(params: ParamsField) {
    this.fields.push({ name: 'data', arguments: this.arguments(params.data) });
  }

  private return(params: ParamsField) {
    this.fields.push({
      name: 'return',
      arguments: this.arguments(params.return),
    });
  }

  private limit(limit: number): this {
    this.options = { ...this.options, limit };
    return this;
  }

  private offset(offset: number): this {
    this.options = { ...this.options, offset };
    return this;
  }

  private join(joiningTables: string[]) {
    const tableJoins = Joins[this.table];

    if (!Array.isArray(tableJoins)) {
      console.error(`Joins for table ${this.table} not found.`);
      return;
    }

    const joins = tableJoins as readonly JoinDefinition[];

    const filteredJoins = joins.filter((join) => joiningTables.includes(join.joiningTable));

    this.options.include = { joins: [] };
    if (filteredJoins.length > 0) {
      const uniqueJoins = new Set([...this.options.include.joins, ...filteredJoins]);

      this.options = {
        ...this.options,
        include: {
          ...this.options.include,
          joins: [...uniqueJoins],
        },
      };
    }
  }

  private selectIncluded(params: string[]) {
    const args: Argument[] = params.map((param) => ({ name: param }));
    this.fields.push({ name: 'select', arguments: args });
  }

  private getNestedKeys(obj: any, parentKey = ''): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...this.getNestedKeys(obj[key], newKey));
      } else {
        keys.push(newKey);
      }
    }

    return keys;
  }

  private orderBy($orderBy: { [K in keyof T]?: 'asc' | 'desc' }) {
    const orderBy = Object.entries($orderBy).map(([field, value]) => ({
      field,
      order: value === 'asc' ? Order.Asc : Order.Desc,
    }));

    this.options = { ...this.options, orderBy };
    return this;
  }

  private arguments(field: ParamsField) {
    const args: Argument[] = [];

    for (const [key, value] of Object.entries(field)) {
      if (value) {
        if (typeof value === 'object') {
          args.push(...this.handleFilter(key, value));
        } else {
          args.push({
            name: key,
            value: value.toString(),
            valueType: typeof value,
          });
        }
      }
    }

    return args;
  }

  private isReturnObject<T>($return: ParamsField): $return is { [K in keyof T]?: true } {
    return typeof $return === 'object';
  }

  private handleFilter(key: string, value: any): Argument[] {
    const args: Argument[] = [];

    if (value.contains) {
      args.push({
        name: key,
        value: `LIKE '%${value.contains}%'`,
        valueType: 'custom',
      });
    }

    if (value.startsWith) {
      args.push({
        name: key,
        value: `LIKE '${value.startsWith}%'`,
        valueType: 'custom',
      });
    }

    if (value.endsWith) {
      args.push({
        name: key,
        value: `LIKE '%${value.endsWith}'`,
        valueType: 'custom',
      });
    }

    if (value.gt) {
      args.push({ name: key, value: `> '${value.gt}'`, valueType: 'custom' });
    }

    if (value.gte) {
      args.push({ name: key, value: `>= '${value.gte}'`, valueType: 'custom' });
    }

    if (value.lt) {
      args.push({ name: key, value: `< '${value.lt}'`, valueType: 'custom' });
    }

    if (value.lte) {
      args.push({ name: key, value: `<= '${value.lte}'`, valueType: 'custom' });
    }

    return args;
  }
}
