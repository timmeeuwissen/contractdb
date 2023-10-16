import connection from '~/helpers/connection'

export const getAll = async () => {
  const [foreignKeyRecords] = await connection().promise().query(
    'select TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME ' +
    'from information_schema.key_column_usage ' +
    'where REFERENCED_TABLE_SCHEMA is not null ');
  
  return foreignKeyRecords.reduce((acc,rec) => {
    if (rec.TABLE_NAME in acc) {
      acc[rec.TABLE_NAME].references[rec.COLUMN_NAME] = {
        table: rec.REFERENCED_TABLE_NAME, 
        column: rec.REFERENCED_COLUMN_NAME
      }
    }
    else {
      acc[rec.TABLE_NAME] = {
        references: {
          [rec.COLUMN_NAME]: {
            table: rec.REFERENCED_TABLE_NAME, 
            column: rec.REFERENCED_COLUMN_NAME
          }
        },
        referencedBy: []
      }
    }
    if (rec.REFERENCED_TABLE_NAME in acc) {
      acc[rec.REFERENCED_TABLE_NAME].referencedBy.push({
        table: rec.TABLE_NAME, 
        column: rec.COLUMN_NAME
      })
    }
    else {
      acc[rec.REFERENCED_TABLE_NAME] = {
        references: {},
        referencedBy: [{
          table: rec.TABLE_NAME, 
          column: rec.COLUMN_NAME
        }]
      }
    }

    return acc;
  }, {})
}

export const getAllByOrder = async () => {
  const [tableRecords] = await connection().promise().query('show tables');
  tableRecords.reduce((acc,entity) => [...acc, {tableName: Object.values(entity)[0]}],[])
  
  // first figure out the tables that demand ordering
  const allRelations = await getAll();
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

export const getForTable = async table => {
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
