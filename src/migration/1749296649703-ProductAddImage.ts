import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductAddImage1749296649703 implements MigrationInterface {
    name = 'ProductAddImage1749296649703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "imagesss" character varying DEFAULT '' `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "imagess"`);
    }

}
