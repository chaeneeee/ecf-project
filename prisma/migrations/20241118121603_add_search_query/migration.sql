-- CreateTable
CREATE TABLE "searchQuery" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "ip" TEXT,
    "userId" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "searchQuery_pkey" PRIMARY KEY ("id")
);
