CREATE TABLE "user_two_factor" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "secret" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "confirmed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "user_two_factor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recovery_codes" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "code_hash" TEXT NOT NULL,
  "used_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "recovery_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_two_factor_user_id_key" ON "user_two_factor"("user_id");

CREATE INDEX "recovery_codes_user_id_idx" ON "recovery_codes"("user_id");

ALTER TABLE "user_two_factor"
  ADD CONSTRAINT "user_two_factor_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "recovery_codes"
  ADD CONSTRAINT "recovery_codes_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
