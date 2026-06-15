-- CreateEnum
CREATE TYPE "GatheringStatus" AS ENUM ('RECRUITING', 'MATCHED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'MEMBER');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXITED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'MATCHED', 'TIMEOUT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "profile_img" TEXT,
    "manner_temperature" DECIMAL(3,1) NOT NULL DEFAULT 36.5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gatherings" (
    "id" UUID NOT NULL,
    "host_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "current_participants" INTEGER NOT NULL DEFAULT 1,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "location_name" TEXT NOT NULL,
    "status" "GatheringStatus" NOT NULL DEFAULT 'RECRUITING',
    "gathering_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gatherings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gathering_participants" (
    "id" UUID NOT NULL,
    "gathering_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gathering_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "gathering_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_queues" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "preferred_category" TEXT,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matching_queues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gathering_participants_gathering_id_user_id_key" ON "gathering_participants"("gathering_id", "user_id");

-- AddForeignKey
ALTER TABLE "gatherings" ADD CONSTRAINT "gatherings_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_participants" ADD CONSTRAINT "gathering_participants_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gatherings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_participants" ADD CONSTRAINT "gathering_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gatherings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_queues" ADD CONSTRAINT "matching_queues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
