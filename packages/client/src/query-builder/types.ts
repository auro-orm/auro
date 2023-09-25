export type QueryBuilderParams<T> = {
  where?: ParamsField;
  select?: ParamsField;
  data?: ParamsField;
  return?: ParamsField;
  avg?: ParamsField;
  groupBy?: string[];
  limit?: number;
  offset?: number;
  orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
  include?: ParamsField;
};

export type ParamsField = {
  [key: string]: any;
};

export type JoinDefinition = {
  table: string;
  key: string;
  joiningTable: string;
  joiningKey: string;
};
