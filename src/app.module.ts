import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './products/products.module';
import { envs } from './products/config';
import { Product } from './products/entity/product.entity';
import { Category } from './products/entity/category.entity';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ProductModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.port,
      username: envs.dbUser,
      password: envs.dbPassword,
      database: envs.dbName,

      synchronize: true,

      autoLoadEntities: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/migration/*.js'],
    }),

    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Servicio adicional para verificar la conexión
    {
      provide: 'DATABASE_CONNECTION_LOGGER',
      useFactory: async () => {
        const logger = new Logger('Database');

        setTimeout(() => {
          logger.log(
            `🗄️  Conectado a PostgreSQL en: ${envs.dbHost}:${envs.port}/${envs.dbName}`,
          );
          logger.debug('✅ ¡Conexión exitosa!');
        }, 1000);
      },
    },
  ],
})
export class AppModule {}
