import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Product } from './products/entity/product.entity';
import { Category } from './products/entity/category.entity';
dotenv.config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [Product , Category],
  migrations: ['src/migration/*.ts'],
  synchronize: false,
});
