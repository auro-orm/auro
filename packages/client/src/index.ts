/* eslint-disable */
import { Query } from './query-runner/query';

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
export const SCHEMA = process.env.SCHEMA || 'public';

export const Joins = {} as any;

export type Connections<T> = never;
