'use strict';

exports.up = function(knex, promise) {
  return promise.all([
    knex.schema.createTable('bets', function (table) {
      table.increments("id").primary();
      table.string("bet_type",30).notNullable();
      table.string("bet_date",10).notNullable().index();
      table.string("match_ref",10).notNullable();
      table.string("match_desc",50).notNullable();
      table.specificType("bet_amt","currency(5,2)");
      table.specificType("return","currency(5,2)");
    })
  ]);
};

exports.down = function(knex, promise) {
  return promise.all([knex.schema.dropTable('bets')]);
};
