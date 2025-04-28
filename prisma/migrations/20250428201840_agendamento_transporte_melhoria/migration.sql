/*
  Warnings:

  - You are about to drop the column `transporte` on the `Agendamento` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TransporteEntrada" AS ENUM ('DONO_TRAZ', 'TAXI_DOG');

-- CreateEnum
CREATE TYPE "TransporteSaida" AS ENUM ('DONO_BUSCA', 'TAXI_DOG');

-- AlterTable
ALTER TABLE "Agendamento" DROP COLUMN "transporte",
ADD COLUMN     "transporteEntrada" "TransporteEntrada" NOT NULL DEFAULT 'DONO_TRAZ',
ADD COLUMN     "transporteSaida" "TransporteSaida" NOT NULL DEFAULT 'DONO_BUSCA';

-- DropEnum
DROP TYPE "Transporte";
