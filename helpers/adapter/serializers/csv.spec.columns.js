import { o_instruction } from "../code/operations/instruction"
import { o_bind } from "../code/operations/bind"

export const basicBinding = {str: 
`col:
`,
exp: [
  [0, o_bind, ["bind",'flat.col',{"definition": "version","number": "1.2",}]],
]}

export const customBinding = {str: 
`col: bindTo(someEntity.someAttribute)
`,
exp: [
  [0, o_bind, ["bind",'someEntity.someAttribute',]],
]}


