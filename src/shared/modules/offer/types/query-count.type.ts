import { Query } from 'express-serve-static-core';

export type TQueryCount = {
  count?: number;
} | Query;
