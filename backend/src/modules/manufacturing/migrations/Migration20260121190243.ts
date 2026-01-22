import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260121190243 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "artisan" ("id" text not null, "name" text not null, "email" text null, "phone" text null, "role" text null, "specialties" jsonb null, "active" boolean not null default true, "completed_orders" integer not null default 0, "average_rating" integer null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "artisan_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_artisan_deleted_at" ON "artisan" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "work_order" ("id" text not null, "order_id" text not null, "order_item_id" text not null, "title" text not null, "size" text null, "sku" text null, "current_stage" text not null default 'design_approved', "status" text not null default 'pending', "priority" text not null default 'normal', "assigned_to" text null, "due_date" timestamptz null, "started_at" timestamptz null, "completed_at" timestamptz null, "notes" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "work_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_work_order_deleted_at" ON "work_order" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "work_order_media" ("id" text not null, "work_order_id" text not null, "stage_id" text null, "url" text not null, "type" text not null default 'image', "caption" text null, "uploaded_by" text null, "uploaded_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "work_order_media_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_work_order_media_deleted_at" ON "work_order_media" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "work_order_stage" ("id" text not null, "work_order_id" text not null, "stage" text not null, "status" text not null default 'pending', "started_at" timestamptz null, "completed_at" timestamptz null, "assigned_to" text null, "notes" text null, "quality_score" integer null, "issues" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "work_order_stage_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_work_order_stage_deleted_at" ON "work_order_stage" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "artisan" cascade;`);

    this.addSql(`drop table if exists "work_order" cascade;`);

    this.addSql(`drop table if exists "work_order_media" cascade;`);

    this.addSql(`drop table if exists "work_order_stage" cascade;`);
  }

}
