import connection from '~/helpers/connection'
import mysql from 'mysql2'
import config from '~/config.json'

const systemTables = ['mysql', 'performance_schema', 'sys']
let typemap
let uniques
let tableDescriptions = {}

export const deconstructTarget = (targetString) => {
  // make sure we know the database, table and column
  let location = targetString.split('.')

  while(location.length < 3) {
    location = [null, ...location];
  }

  const [database, table, column] = location;
  return {database: database || config.connection.database, table, column}
}


export const getType = intType => {
  if (!typemap) typemap = Object.entries(mysql.Types).reduce((acc,[k,v]) => ({...acc, [String(v)]: k}),{})
  if (!(String(intType) in typemap)) throw new Error('unknown type')
  return typemap[String(intType)]
}

export const getAllPrimaryKeys = async () => {
  const [primaryKeyRecords] = await connection().promise().query(
    `select ` +
    `    TABLE_SCHEMA as 'database', ` +
    `    TABLE_NAME as 'table', ` +
    `    COLUMN_NAME as 'column' ` +
    `from information_schema.key_column_usage ` +
    `where CONSTRAINT_NAME = 'PRIMARY' ` +
    `and TABLE_SCHEMA not in (${systemTables.map(key => `'${key}'`).join(',')})`
  )

  return primaryKeyRecords.reduce((acc, {database, table, column}) => {
    if(!(database in acc)) {
      acc[database] = {}
    }
    if(!(table in acc[database])) {
      acc[database][table] = column
    }
    return acc
  }, {})
} 

// todo: include database in structure
export const getAllConstraints = async () => {
  const [foreignKeyRecords] = await connection().promise().query(
    'select TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME, CONSTRAINT_NAME ' +
    'from information_schema.key_column_usage ' +
    'where REFERENCED_TABLE_SCHEMA is not null ');
  
  return foreignKeyRecords.reduce((acc,rec) => {
    if (rec.TABLE_NAME in acc) {
      acc[rec.TABLE_NAME].references[rec.COLUMN_NAME] = {
        table: rec.REFERENCED_TABLE_NAME, 
        column: rec.REFERENCED_COLUMN_NAME,
        constraint: rec.CONSTRAINT_NAME
      }
    }
    else {
      acc[rec.TABLE_NAME] = {
        references: {
          [rec.COLUMN_NAME]: {
            table: rec.REFERENCED_TABLE_NAME, 
            column: rec.REFERENCED_COLUMN_NAME,
            constraint: rec.CONSTRAINT_NAME
          }
        },
        referencedBy: []
      }
    }
    if (rec.REFERENCED_TABLE_NAME in acc) {
      acc[rec.REFERENCED_TABLE_NAME].referencedBy.push({
        table: rec.TABLE_NAME, 
        column: rec.COLUMN_NAME,
        constraint: rec.CONSTRAINT_NAME
      })
    }
    else {
      acc[rec.REFERENCED_TABLE_NAME] = {
        references: {},
        referencedBy: [{
          table: rec.TABLE_NAME, 
          column: rec.COLUMN_NAME,
          constraint: rec.CONSTRAINT_NAME
        }]
      }
    }

    return acc;
  }, {})
}

export const getTablesByConstrainingOrder = async () => {
  const [tableRecords] = await connection().promise().query('show tables');
  tableRecords.reduce((acc,entity) => [...acc, {tableName: Object.values(entity)[0]}],[])
  
  // first figure out the tables that demand ordering
  const allRelations = await getAllConstraints();
  const lookup = {}, order = [];
  let maxIt = 500
  while (Object.length(allRelations) && maxIt--) {
    Object.keys(allRelations).forEach(table => {
      if (!Object.values(allRelations.references).find(ref => !(ref.table in lookup) && ref.table != table)){
        lookup[table] = true;
        order.push(table)
        delete allRelations[table]
      }
    })
  }
  if (!maxIt) {
    throw new Error('Max iterations reached')
  }

  // then amend all tables that do not have a constraint
  tableRecords.forEach(table => {
    if (!(table in lookup)) {
      order.push(table);
    }
  })

  return order
}

export const getConstraintsForTable = async table => {
  const [foreignKeyRecords] = await connection().promise().query(
    'select TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME ' +
    'from information_schema.key_column_usage ' +
    'where REFERENCED_TABLE_SCHEMA is not null ' +
    `and (TABLE_NAME = '${table}' or REFERENCED_TABLE_NAME = '${table}')`);

  return foreignKeyRecords.reduce((acc,rec) => {
    if (rec.TABLE_NAME == table) {
      acc.references[rec.COLUMN_NAME] = {
        table: rec.REFERENCED_TABLE_NAME, 
        column: rec.REFERENCED_COLUMN_NAME
      }
    }
    if (rec.REFERENCED_TABLE_NAME == table) {
      acc.referencedBy.push({
        table: rec.TABLE_NAME, 
        column: rec.COLUMN_NAME
      })
    }

    return acc;
  }, {references: {}, referencedBy: []})
}

export const getUniques = async (database, table) => {
  if (uniques) {
    if(!(database in uniques)) throw new Error(`Could not resolve uniques for DB ${database}`)
    if(!(table in uniques[database])) throw new Error(`Could not resolve uniques for table ${database}.${table}`)
    return uniques[database][table]
  }
  uniques = (await connection().promise().query(
      `select ` +
      `  information_schema.TABLE_CONSTRAINTS.CONSTRAINT_SCHEMA, ` +
      `  information_schema.TABLE_CONSTRAINTS.CONSTRAINT_NAME, ` +
      `  information_schema.TABLE_CONSTRAINTS.TABLE_NAME, ` +
      `  information_schema.KEY_COLUMN_USAGE.COLUMN_NAME ` +

      `from information_schema.TABLE_CONSTRAINTS ` +

      `inner join information_schema.KEY_COLUMN_USAGE ` +
      `on information_schema.KEY_COLUMN_USAGE.CONSTRAINT_SCHEMA = information_schema.TABLE_CONSTRAINTS.CONSTRAINT_SCHEMA ` +
      `and information_schema.KEY_COLUMN_USAGE.CONSTRAINT_NAME = information_schema.TABLE_CONSTRAINTS.CONSTRAINT_NAME ` +
      `and information_schema.KEY_COLUMN_USAGE.TABLE_NAME = information_schema.TABLE_CONSTRAINTS.TABLE_NAME ` +

      `where information_schema.TABLE_CONSTRAINTS.CONSTRAINT_SCHEMA not in ('mysql', 'performance_schema', 'sys') ` +
      `and information_schema.TABLE_CONSTRAINTS.CONSTRAINT_TYPE in ('UNIQUE', 'PRIMARY KEY') `
    ))[0].reduce((acc, rec) => {
    
      if (!(rec.CONSTRAINT_SCHEMA in acc)) {
        acc[rec.CONSTRAINT_SCHEMA] = {}
      }
      if (!(rec.TABLE_NAME in acc[rec.CONSTRAINT_SCHEMA])) {
        acc[rec.CONSTRAINT_SCHEMA][rec.TABLE_NAME] = {}
      }
      if (!(rec.CONSTRAINT_NAME in acc[rec.CONSTRAINT_SCHEMA][rec.TABLE_NAME])) {
        acc[rec.CONSTRAINT_SCHEMA][rec.TABLE_NAME][rec.CONSTRAINT_NAME] = []
      }

      acc[rec.CONSTRAINT_SCHEMA][rec.TABLE_NAME][rec.CONSTRAINT_NAME].push(rec.COLUMN_NAME)

      return acc
    },{})

  return uniques[database][table]
}

export const get_tableDescription = async (database, table) => {
  if (!(database in tableDescriptions)) tableDescriptions[database] = {}
  if (table in tableDescriptions[database]) return tableDescriptions[database][table]
  
  const [records] = await connection().promise().query(
    `describe ${database}.${table}`
  )
  
  tableDescriptions[database][table] = records.reduce(
    (acc, rec) => ({...acc, [rec.Field]: rec}),
    {}
  )

  return tableDescriptions[database][table]
}