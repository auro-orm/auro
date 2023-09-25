import { QueryBuilder } from '../src/query-builder/builder';
import { QueryBuilderParams } from '../src/query-builder/types';
import { SCHEMA } from '../src';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder<any>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder('myTable', 'myOperation');
  });

  it('should construct a QueryBuilder instance', () => {
    expect(queryBuilder).toBeInstanceOf(QueryBuilder);
  });

  it('should build a query', () => {
    const params: QueryBuilderParams<any> = {
      where: {
        fieldName: 'fieldValue',
      },
      select: {
        field1: true,
        field2: true,
      },
    };

    const query = queryBuilder.fill(params).build();

    expect(query.metadata.command).toBe('myOperation');
    expect(query.metadata.table).toBe('myTable');
    expect(query.metadata.schema).toBe(SCHEMA);
  });

  it('should handle data', () => {
    const params = {
      data: {
        field1: 'value1',
        field2: 42,
      },
    };

    queryBuilder.fill(params);

    expect(queryBuilder['fields']).toContainEqual({
      name: 'data',
      arguments: [
        { name: 'field1', value: 'value1', valueType: 'string' },
        { name: 'field2', value: '42', valueType: 'number' },
      ],
    });
  });

  it('should handle groupBy', () => {
    const params: QueryBuilderParams<any> = {
      groupBy: ['field1', 'field2'],
    };

    queryBuilder.fill(params);

    expect(queryBuilder['options'].groupBy).toEqual(['field1', 'field2']);
  });

  it('should handle orderBy', () => {
    enum Order {
      Asc = 0,
      Desc = 1,
    }

    const params: QueryBuilderParams<any> = {
      orderBy: {
        field1: 'asc',
        field2: 'desc',
      },
    };

    queryBuilder.fill(params);

    expect(queryBuilder['options'].orderBy).toEqual([
      { field: 'field1', order: Order.Asc },
      { field: 'field2', order: Order.Desc },
    ]);
  });

  it('should handle return', () => {
    const params = {
      return: {
        field1: true,
        field2: true,
      },
    };

    queryBuilder.fill(params);

    expect(queryBuilder['fields']).toContainEqual({
      name: 'return',
      arguments: [
        { name: 'field1', value: 'true', valueType: 'boolean' },
        { name: 'field2', value: 'true', valueType: 'boolean' },
      ],
    });
  });

  it('should handle limit', () => {
    const params = {
      limit: 10,
    };

    queryBuilder.fill(params);

    expect(queryBuilder['options'].limit).toBe(10);
  });

  it('should handle offset', () => {
    const params = {
      offset: 5,
    };

    queryBuilder.fill(params);

    expect(queryBuilder['options'].offset).toBe(5);
  });

  it('should handle where', () => {
    const params = {
      where: {
        field1: 'value1',
        field2: {
          gt: 42,
        },
      },
    };

    queryBuilder.fill(params);

    expect(queryBuilder['fields']).toContainEqual({
      name: 'where',
      arguments: [
        { name: 'field1', value: 'value1', valueType: 'string' },
        { name: 'field2', value: "> '42'", valueType: 'custom' },
      ],
    });
  });

  it('should handle noreturn', () => {
    const params = {};

    queryBuilder.fill(params);

    expect(queryBuilder['fields']).toContainEqual({
      name: 'no_return',
      arguments: [],
    });
  });

  it('should handle handleFilter', () => {
    const params = {
      where: {
        field1: {
          contains: 'searchTerm',
        },
        field2: {
          startsWith: 'prefix',
        },
        field3: {
          endsWith: 'suffix',
        },
        field4: {
          gt: 42,
          gte: 50,
          lt: 30,
          lte: 20,
        },
      },
    };

    queryBuilder.fill(params);

    expect(queryBuilder['fields']).toContainEqual({
      name: 'where',
      arguments: [
        {
          name: 'field1',
          value: `LIKE '%searchTerm%'`,
          valueType: 'custom',
        },
        {
          name: 'field2',
          value: `LIKE 'prefix%'`,
          valueType: 'custom',
        },
        {
          name: 'field3',
          value: `LIKE '%suffix'`,
          valueType: 'custom',
        },
        {
          name: 'field4',
          value: "> '42'",
          valueType: 'custom',
        },
        {
          name: 'field4',
          value: ">= '50'",
          valueType: 'custom',
        },
        {
          name: 'field4',
          value: "< '30'",
          valueType: 'custom',
        },
        {
          name: 'field4',
          value: "<= '20'",
          valueType: 'custom',
        },
      ],
    });
  });
});
