/*
  Warnings:

  - You are about to drop the column `tipoPrecificacao` on the `Servico` table. All the data in the column will be lost.
  - You are about to drop the `PrecoPorPeso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrecoPorRaca` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrecoPorPeso" DROP CONSTRAINT "PrecoPorPeso_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "PrecoPorRaca" DROP CONSTRAINT "PrecoPorRaca_servicoId_fkey";

-- AlterTable
ALTER TABLE "Servico" DROP COLUMN "tipoPrecificacao";

-- DropTable
DROP TABLE "PrecoPorPeso";

-- DropTable
DROP TABLE "PrecoPorRaca";

-- CreateTable
CREATE TABLE "Preco" (
    "id" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "raca" TEXT,
    "peso" INTEGER,
    "preco" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preco_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preco_servicoId_raca_peso_key" ON "Preco"("servicoId", "raca", "peso");

-- AddForeignKey
ALTER TABLE "Preco" ADD CONSTRAINT "Preco_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
