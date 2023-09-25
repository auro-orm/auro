export type Column = {
  name: string;
  data_type: string;
  is_nullable: string;
  is_primary_key: string;
};

export type Table = {
  table_name: string;
  columns: Column[];
};

export type Joins = Record<string, { table: string; key: string; joiningTable: string; joiningKey: string }[]>;
export type Join = { table: string; key: string; joiningTable: string; joiningKey: string };
export type Row = { table_name: string; column_name: string; foreign_table_name: string; foreign_column_name: string };
