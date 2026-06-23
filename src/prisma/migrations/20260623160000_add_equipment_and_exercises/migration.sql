CREATE TABLE "equipment" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "scope" VARCHAR(20) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercises" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "scope" VARCHAR(20) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_equipment" (
  "exercise_id" UUID NOT NULL,
  "equipment_id" UUID NOT NULL,

  CONSTRAINT "exercise_equipment_pk" PRIMARY KEY ("exercise_id", "equipment_id")
);

CREATE INDEX "equipment_user_id_idx" ON "equipment"("user_id");
CREATE INDEX "exercises_user_id_idx" ON "exercises"("user_id");
CREATE INDEX "exercise_equipment_equipment_id_idx" ON "exercise_equipment"("equipment_id");

ALTER TABLE "equipment"
  ADD CONSTRAINT "equipment_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "exercise_equipment"
  ADD CONSTRAINT "exercise_equipment_exercise_id_fk"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "exercise_equipment"
  ADD CONSTRAINT "exercise_equipment_equipment_id_fk"
  FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
