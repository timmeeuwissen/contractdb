import * as allBind from './operations/bind'
import * as allCondition from './operations/condition'
import * as allForeach from './operations/foreach'
import * as allInstruction from './operations/instruction'

export default {
  ...allBind,
  ...allCondition,
  ...allForeach,
  ...allInstruction,
}