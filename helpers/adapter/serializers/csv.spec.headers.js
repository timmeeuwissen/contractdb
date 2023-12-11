import { o_instruction } from "../code/operations/instruction"

export const basicHeader = {str: 
`version 1.2
@quoted
`,
exp: [
  [0, o_instruction, ["version",{"definition": "version","number": "1.2",}]],
  [1, o_instruction, ["trailing_characters",{"trail": '\n',},]],
  [0, o_instruction, ["global_setting",{"instruction": "quoted","arguments": []},]]
]}

export const headerWithComment = { str: 
`@permitempty // file can be empty
`,
exp: [
  [0, o_instruction, ["global_setting",{"instruction": "permitempty","arguments": [""],}]],
  [1, o_instruction, ["single_line_comment",{"comment": ' file can be empty\n',},]],
]}

export const singleLineComment = { str: 
`// single line root comments can be made
`,
exp: [
  [0, o_instruction, ["single_line_comment",{"comment": ' single line root comments can be made\n',},]],
]}


export const headerWithMultilineComment = { str: 
`@totalColumns 20 /*
there can be a total of ... columns in this file
*/
`,
exp: [
  [0, o_instruction, ["global_setting",{"instruction": "totalColumns","arguments": ["20"],}]],
  [1, o_instruction, ["multi_line_comment",{"comment": '\nthere can be a total of ... columns in this file\n',},]],
  [1, o_instruction, ["trailing_characters",{"trail": '\n',},]],
]}

export const multilineComment = { str: 
`/*
That was the end of the header


*/`,
exp: [
  [0, o_instruction, ["multi_line_comment",{"comment": '\nThat was the end of the header\n\n\n',},]],
]}

export const headerWithArguments = { str: 
`@separator ';'`,
exp: () => ([

])}
  

export const header = { str:
`${basicHeader.str}
${headerWithArguments.str}
${headerWithComment.str}
${headerWithMultilineComment.str}
${multilineComment.str}`,
exp: () => ([

])}