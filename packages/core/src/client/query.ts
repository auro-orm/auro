import { query, queryRaw } from '@auro-orm/engine';

export const executeQuery = async (fields: any, options: any, metadata: any) => {
  return await query(fields, options, metadata);
};

export const executeRawQuery = async (query: string) => {
  const jsonEntity = await queryRaw(query);
  return jsonEntity ? JSON.parse(jsonEntity) : null;
};
