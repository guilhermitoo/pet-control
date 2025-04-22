-- CreateEnum
CREATE TYPE "TipoPrecificacao" AS ENUM ('PESO', 'RACA', 'AMBOS');

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "observacoes" TEXT,
    "tipoPrecificacao" "TipoPrecificacao" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecoPorPeso" (
    "id" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "pesoInicial" DOUBLE PRECISION NOT NULL,
    "pesoFinal" DOUBLE PRECISION NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrecoPorPeso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecoPorRaca" (
    "id" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrecoPorRaca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrecoPorPeso_servicoId_pesoInicial_pesoFinal_key" ON "PrecoPorPeso"("servicoId", "pesoInicial", "pesoFinal");

-- CreateIndex
CREATE UNIQUE INDEX "PrecoPorRaca_servicoId_raca_key" ON "PrecoPorRaca"("servicoId", "raca");

-- AddForeignKey
ALTER TABLE "PrecoPorPeso" ADD CONSTRAINT "PrecoPorPeso_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecoPorRaca" ADD CONSTRAINT "PrecoPorRaca_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
