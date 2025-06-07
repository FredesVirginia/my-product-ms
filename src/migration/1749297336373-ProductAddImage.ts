import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductAddImage1749297336373 implements MigrationInterface {
    name = 'ProductAddImage1749297336373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "imagess" TO "imagesss"`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "imagesss" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "imagesss" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "imagesss" TO "imagess"`);
    }

}
