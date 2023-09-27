import { Join } from './types';
import * as fs from 'fs';
import path from 'path';
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, function (str) {
    return str[1].toUpperCase();
  });
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function mapDataType(dataType: string) {
  switch (dataType) {
    case 'bigint':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'character varying':
      return 'StringField';
    case 'date':
      return 'DateField';
    case 'integer':
      return 'number';
    case 'jsonb':
      return 'any';
    case 'smallint':
      return 'number';
    case 'text':
      return 'StringField';
    case 'timestamp with time zone':
      return 'DateField';
    default:
      return 'unknown';
  }
}

export function getStaticJs() {
  const schema = process.env.SCHEMA || 'public';
  return `"use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.SCHEMA = void 0;
  exports.SCHEMA = '${schema}';
  const query_1 = require("./query-runner/query");`;
}

export function createQueryJs(interfaceName: string, tableName: string) {
  return `  this.${interfaceName} = new query_1.Query('${tableName}');`;
}

export function createAuroClientJs(actionsString: string) {
  return `class AuroClient {\n  constructor() {\n\n${actionsString}\n}\n
  async queryRaw(query) {
    return query_1.Query.raw(query);
}
  }
exports.AuroClient = AuroClient;\n`;
}

export function createQuery(interfaceName: string) {
  return `  ${interfaceName}: Query<${capitalizeFirstLetter(interfaceName)}>;`;
}

export function createAuroClient(actionsString: string) {
  return `export declare class AuroClient {\n  constructor()\n\n${actionsString}\n
    async queryRaw<T>(query: string): Promise<T | null> {
      return Query.raw<T>(query);
    }
  }\n`;
}

export function writeIndexFile(result: string[]): void {
  const indexFile = result.join('\n');
  // const fileName = path.join(__dirname, '../../../client/src/index.ts', ''); // Local
  const packageName = '@auro-orm/client';

  const packageDir = require.resolve(`${packageName}/package.json`);
  const packageRoot = path.dirname(packageDir);

  const filePathWithinPackage = 'dist/index.d.ts';

  const targetFilePath = path.join(packageRoot, filePathWithinPackage);

  try {
    fs.writeFileSync(targetFilePath, indexFile);
    console.log(`Content written to ${targetFilePath}`);
  } catch (err) {
    console.error('Error writing content:', err);
  }
}

export function writeIndexJsFile(result: string[]): void {
  const indexFile = result.join('\n');
  // const fileName = path.join(__dirname, '../../../client/src/index.ts', ''); // Local
  const packageName = '@auro-orm/client';

  const packageDir = require.resolve(`${packageName}/package.json`);
  const packageRoot = path.dirname(packageDir);

  const filePathWithinPackage = 'dist/index.js';

  const targetFilePath = path.join(packageRoot, filePathWithinPackage);

  try {
    fs.writeFileSync(targetFilePath, indexFile);
    console.log(`Content written to ${targetFilePath}`);
  } catch (err) {
    console.error('Error writing content:', err);
  }
}

export function createTable(column: any) {
  return {
    table_name: column.table_name,
    columns: [
      {
        name: column.column_name,
        data_type: column.data_type,
        is_nullable: column.is_nullable,
        is_primary_key: column.is_primary_key,
      },
    ],
  };
}

export function hasValidJoins(joins: Record<string, any[]>): boolean {
  return Object.keys(joins).length > 0;
}

function generateJoinInfo(info: Join): string {
  return `{ table: '${info.table}', key: '${info.key}', joiningTable: '${info.joiningTable}', joiningKey: '${info.joiningKey}' }`;
}

export function createConnectionType(table: string, joinInfo: any[]): string {
  return `  T extends ${capitalizeFirstLetter(table)} ? { ${table}: ${capitalizeFirstLetter(joinInfo[0].joiningTable)} }`;
}

export function createJoin(table: string, joinInfo: Join[]): string {
  return `  ${table}: [${joinInfo.map((info) => generateJoinInfo(info)).join(', ')}] as const,`;
}

export function createImport(type: string, name: string): string {
  return `import { ${type} } from './${name.toLowerCase()}';`;
}

export function getStaticTypes() {
  return `/* eslint-disable */
import { Query } from './query-runner/query';\n
export type WithSkipTake<T> = T extends { skip: number; take: number; orderBy: any }
  ? { take: T['take']; skip: T['skip']; orderBy: T['orderBy'] }
  : { take?: number; skip?: number; orderBy?: any };

export type CreateOptionsParams<T> = T & WithSkipTake<T>;

export type InsertOneParams<T> = {
  data: T;
  return?: { [K in keyof T]?: true } | boolean;
};

type IncludeParams<T> = {
  [K in keyof T]?: boolean;
};

type GenerateIncludeType<T> = {
  [K in keyof T]?: IncludeParams<T[K]>;
};

export type FindUniqueParams<T, K extends keyof T> = {
  where: {
    [P in keyof T]?: T[P] | (T[P] extends string ? { startWith: string; endsWith: string } : never);
  };
  select?: { [P in K]?: boolean };
  orderBy?: Partial<Record<Extract<keyof T, keyof Partial<T>>, 'asc' | 'desc'>>;
} & (
  | { include?: GenerateIncludeType<Connections<T>>; groupBy?: never }
  | { groupBy?: (keyof T)[] extends (keyof T & string)[] ? (keyof T & string)[] : never; include?: never }
);

export type FindManyParams<T, K extends keyof T> = {
  where?: Partial<T>;
  select?: { [P in K]?: boolean };
  skip?: number;
  take?: number;
} & ({ include?: GenerateIncludeType<Connections<T>>; groupBy?: never } | { groupBy?: string[]; include?: never });

export type InsertManyParams<T> = {
  data: T[];
  return?: { [K in keyof T]?: boolean };
};

export type UpdateManyParams<T> = {
  where?: Partial<T>;
  set: Partial<T>;
  return?: { [K in keyof T]?: boolean };
};

export type DeleteOneParams<T> = {
  where: T;
  return?: { [K in keyof T]?: true } | boolean;
};

export type DeleteManyParams<T> = {
  where?: Partial<T>;
  return?: { [K in keyof T]?: true } | boolean;
};

export type UpdateOneParams<T> = {
  where: T;
  return?: { [K in keyof T]?: true } | boolean;
  set: Partial<T>;
};

export type AggregateParams<T> = {
  where?: Partial<T>;
} & ({ count: { [K in keyof T]?: true } | boolean; avg?: never } | { avg: { [K in keyof T]?: true } | boolean; count?: never });

type StringFilter = {
  equals?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
};

type DateFilter = {
  equals?: Date;
  gt?: Date;
  gte?: Date;
  lt?: Date;
  lte?: Date;
};

export type StringField = StringFilter | string;
export type DateField = DateFilter | string;
`;
}
// export const SCHEMA = process.env.SCHEMA || 'public'; Not sure about this one
