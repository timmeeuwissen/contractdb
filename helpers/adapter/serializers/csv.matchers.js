import operations from "../code/operations"

export const matchers = [
  [ 
    'version',
    /^(?<definition>version) (?<number>\d\.?\d)/gm,
    (name, codeTree, match) => 
      codeTree
        .add_operation(operations.o_instruction, [name, match.groups]),
  ],
  [ 
    'single_line_comment',
    /^\/\/(?<comment>.*[\r\n]+)/gm,
    (name, codeTree, match, {startOfLine, signalEndOfLine}) => {
      signalEndOfLine()
      return startOfLine
        ? codeTree.add_operation(operations.o_instruction, [name, match.groups])
        : codeTree
            .stepIn()
              .add_operation(operations.o_instruction, [name, match.groups])
            .stepOut()
    },
  ],
  [ 
    'multi_line_comment',
    /^\/\*(?<comment>[\s\S]*?)\*\//gm,
    (name, codeTree, match, {startOfLine}) => {
      return startOfLine
        ? codeTree.add_operation(operations.o_instruction, [name, match.groups])
        : codeTree
            .stepIn()
              .add_operation(operations.o_instruction, [name, match.groups])
            .stepOut()
    },
  ],  
  [ 
    'trailing_characters',
    /^(?<trail>[\s\t]*\r?\n)/gm,
    (name, codeTree, match, {startOfLine, signalEndOfLine}) => {
      signalEndOfLine()
      return startOfLine
        ? codeTree.add_operation(operations.o_instruction, [name, match.groups])
        : codeTree
            .stepIn()
              .add_operation(operations.o_instruction, [name, match.groups])
            .stepOut()

    },
  ],
  [ 
    'global_setting',
    /^@(?<instruction>[^\s]+)\s?(?<arguments>.*?)(?=\/\/|\/\*|[\r\n])/gm,
    (name, codeTree, match) => 
      codeTree
        .add_operation(operations.o_instruction, [name, {
          ...match.groups, 
          arguments: match.groups.arguments.split(/\s/).filter(v => v != "")
        }]),
  ],
  [ 
    'global_setting',
    /^@(?<instruction>[^\s]+)\s?(?<arguments>.*?)(?=\/\/|\/\*|[\r\n])/gm,
    (name, codeTree, match) => 
      codeTree
        .add_operation(operations.o_instruction, [name, {
          ...match.groups, 
          arguments: match.groups.arguments.split(/\s/).filter(v => v != "")
        }]),
  ],
  [
    'column_binding',
    /^(?<col>[a-zA-Z0-9\.\-_]+):\s?(?<properties>.*)/g,
    (name, codeTree, match, {signalEndOfLine}) => {
      signalEndOfLine()
      const {col, properties} = match.groups
    }
  ]
]