import { introspect, getForeignKeysData } from '@auro-orm/engine';

import {
  capitalizeFirstLetter,
  createAuroClient,
  createAuroClientJs,
  createConnectionType,
  createJoin,
  createQuery,
  createQueryJs,
  createTable,
  getStaticJs,
  getStaticTypes,
  hasValidJoins,
  mapDataType,
  snakeToCamel,
  writeIndexFile,
  writeIndexJsFile,
} from './util';
import { Column, Join, Joins, Row, Table } from './types';

function parseTables(jsonStr: string): Table[] {
  const parsedJson = JSON.parse(jsonStr);
  const tables: Table[] = [];

  parsedJson.forEach((column: any) => {
    const table = tables.find((t) => t.table_name === column.table_name);
    handleTable(table, tables, column);
  });

  return tables;
}

function handleTable(table: Table | undefined, tables: Table[], column: any) {
  if (!table || typeof table === 'undefined') {
    tables.push(createTable(column));
  }

  const existingColumn = table?.columns.find((c) => c.name === column.column_name);

  if (!existingColumn) {
    table?.columns.push({
      name: column.column_name,
      data_type: column.data_type,
      is_nullable: column.is_nullable,
      is_primary_key: column.is_primary_key,
    });
  }
}

function generateTypeScriptInterfaces(tables: Table[], result: string[]) {
  for (const table of tables) {
    result.push(`export type ${capitalizeFirstLetter(snakeToCamel(table.table_name))} = {`);
    createDataTypes(table.columns, result);
    result.push('};\n');
  }
}

function createDataTypes(columns: Column[], result: string[]) {
  for (const column of columns) {
    const nullable = column.is_nullable === 'YES' ? ' | null' : '';
    const primaryKey = column.is_primary_key === 'YES' ? '' : '?';
    result.push(`  ${snakeToCamel(column.name)}${primaryKey}: ${mapDataType(column.data_type)}${nullable};`);
  }
}

function generateClientClass(interfaces: Table[], result: string[]) {
  const actionsString = interfaces.map(({ table_name }) => createQuery(snakeToCamel(table_name))).join('\n\n');

  result.push(createAuroClient(actionsString));
}

async function createJoinForTables(tables: Table[], result: string[], jsLines: string[]) {
  const allJoins: Joins[] = [];

  for (const table of tables) {
    const joinsData = await getForeignKeysData(table.table_name);

    if (joinsData) {
      const joins: Join = JSON.parse(joinsData);

      if (Array.isArray(joins) && joins.length > 0) {
        // TODO: This is a hack, fix it above
        allJoins.push(...joins);
      }
    }
  }
  if (allJoins.length === 0) {
    result.push(`export declare const Joins: any;\n\nexport type Connections<T> = never;\n`);
    jsLines.push(`exports.Joins = {}`);
    return;
  }

  const joins = generateJoinsAndConnectionsFromSQLResult(JSON.stringify(allJoins), jsLines);
  result.push(joins);
}

function generateJoinsAndConnectionsFromSQLResult(data: string, jsLines: string[]): string {
  const sqlResult = JSON.parse(data)[0];
  const joins = groupColumnsByTable(sqlResult);
  if (!hasValidJoins(joins)) {
    return '';
  }

  const joinsCode = generateJoinsCode(joins);
  const connectionsType = generateConnectionsType(joins);
  jsLines.push(`exports.Joins = {\n${joinsCode}\n}`);
  return `export declare const Joins: any;\n\n${connectionsType}`;
}

function groupColumnsByTable(sqlResult: any[]): Joins {
  return sqlResult.reduce((joins: Joins, row: Row) => (createJoinForRow(row, joins), joins), {});
}

function createJoinForRow(row: Row, joins: Joins) {
  const { table_name, column_name, foreign_table_name, foreign_column_name } = row;

  if (!table_name || !column_name || !foreign_table_name || !foreign_column_name) {
    return;
  }

  if (!joins[table_name]) {
    joins[table_name] = [];
  }

  joins[table_name].push({
    table: table_name,
    key: column_name,
    joiningTable: foreign_table_name,
    joiningKey: foreign_column_name,
  });
}

function generateJoinsCode(joins: Joins): string {
  const joinCode = [];

  for (const table in joins) {
    if (joins.hasOwnProperty(table)) {
      const joinInfo = joins[table];
      joinCode.push(createJoin(table, joinInfo));
    }
  }

  return joinCode.join('\n');
}

function generateConnectionsType(joins: Record<string, any[]>): string {
  const connectionTypes = Object.entries(joins).map(([table, joinInfo]) => {
    return createConnectionType(table, joinInfo);
  });

  if (connectionTypes.length === 0) {
    return 'type Connections<T> = never;\n';
  }

  const code = 'type Connections<T> =\n  ' + connectionTypes.join('\n  | ') + ';\n  : never;\n';
  return code;
}

function generateJsClass(tables: Table[], result: string[]) {
  const actionsString = tables.map(({ table_name }) => createQueryJs(snakeToCamel(table_name), table_name)).join('\n\n');

  result.push(createAuroClientJs(actionsString));
}

export const introspectDatabase = async () => {
  const metadata = await introspect();
  const lines: string[] = [getStaticTypes()];
  const jsLines: string[] = [getStaticJs()];
  const tables = parseTables(metadata);

  generateTypeScriptInterfaces(tables, lines);
  generateClientClass(tables, lines);
  await createJoinForTables(tables, lines, jsLines);

  writeIndexFile(lines);
  generateJsClass(tables, jsLines);
  writeIndexJsFile(jsLines);
};
