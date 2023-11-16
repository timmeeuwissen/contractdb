import { get_template } from '../modelMapper'
import { getAllConstraints } from '../dbSchema'
import connection from '../connection'
import { Exception } from 'sass'

// todo : invert the logic of the methods
const defaultMethods = {
  split: (value, args) => String(value).split(args.pattern),
  conditionalRemap: (value, args) => {
    if ('targets' in args && value) {
      args.targets.forEach()
    }
    return value
    // todo : write method, requires access to template?
  },
  boolRemap: (value, args) => {
    if('valuesToTrue' in args && value in args.valuesToTrue) return true
    if('valuesToFalse' in args && value in args.valuesToTrue) return false
    if('default' in args) return args.default
    return null
  }
}

export const get_query = async (mapDef, methods) => {
  const { template, _keyToField } = get_template(mapDef, methods)
  const tree = template.getTree()
  const allConstraints = await getAllConstraints()

  const format_uniqueTableRef = (treeNode, ancestors = []) => {
    const uniques = [...ancestors, treeNode].reduce(
      (acc, ancestor) => {
        if (ancestor.type == 'field') {
          const { table, field } = ancestor.meta
          const last = acc.length 
            ? structuredClone(acc[0])
            : {
              meta: null, 
              uniqueParts: [], 
              unique: null,
              properties: null
            }
          last.meta = ancestor.meta
          last.uniqueParts.push(
            allConstraints[table] && allConstraints[table][field]
              ? allConstraints[table][field].constraint
              : table
          )
          last.unique = last.uniqueParts.join('_')
          last.properties = ancestor.properties
          acc = [last, ...acc]
        }
        return acc
      },
      []
    )

    const 
      [{meta: currMeta, unique: currUnique, properties: currProperties}] = uniques,
      select = [currUnique, currMeta.field].join('.') + ' as `' + currProperties.srcKey + '`',
      join = uniques.length > 1 
        ? ` left join ${currMeta.database}.${currMeta.table} as \`${currUnique}\` ` +
          ` on \`${uniques[1].unique}\`.${uniques[1].meta.field} = \`${currUnique}\`.${currMeta.field} `
        : undefined

    return {
      select,
      join, 
      uniques,
    }
  }

  // depth first approach 
  const traverse = (treeNode, ancestors = []) => {
    let result = {
      selectClause: [],
      joinClause: [],
      from: null,
    }

    if('children' in treeNode || Array.isArray(treeNode)) {
      const children = treeNode.children || treeNode
      result = children.reduce(
        (acc, childNode) => {
          const { selectClause, joinClause, from } = traverse(childNode, [...ancestors, treeNode])
          acc.selectClause = [ ...acc.selectClause, ...selectClause ]
          acc.joinClause = [ ...acc.joinClause, ...joinClause ]
          acc.from = from
          return acc
        }, 
        result
      )
    }
    // we are at the end of the tree, this means that we are inherently at a field definition.
    else if(treeNode.type == 'field') {
      const {select, join, uniques} = format_uniqueTableRef(treeNode, ancestors)
      
      result.selectClause.push(select)
      if (join) {
        result.joinClause.push(join)
      }

      // when there is no parent, we are at the root-level of the structure
      if (uniques.length == 1) {
        // for now, don't allow multiple root-tables
        if (result.from && result.from != treeNode.meta.table) {
          throw new Exception('Multiple highlevel tables, refuse to join without on-clause')
        }
        if (!result.from) {
          console.log('result from is', treeNode.meta.table)
          result.from = treeNode.meta.table
        }
      }

      // even when there is no parent, we need to add the record to the select clause,
      // and we need to name it like the field in the import definition states
      result.selectClause.push()
    }
    return result

  }

  const queryParts = traverse(tree),
    query = 
      `select ${queryParts.selectClause.join(', ')} ` + 
      `from ${queryParts.from} ${queryParts.joinClause.join(' ')}`

  return query
}

export const get_data = async (exporterType) => {
  const query = await get_query(exporterType)
  console.log('query is:', query)
  const records = await connection().promise().query(query)
  return records
}