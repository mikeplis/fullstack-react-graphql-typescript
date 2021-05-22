import { Migration } from '@mikro-orm/migrations';

export class Migration20210522001915 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "app_user" ("id" serial primary key, "username" text not null, "email" text not null, "password" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "app_user" add constraint "app_user_username_unique" unique ("username");');
    this.addSql('alter table "app_user" add constraint "app_user_email_unique" unique ("email");');

    this.addSql('drop table if exists "user" cascade;');
  }

}
