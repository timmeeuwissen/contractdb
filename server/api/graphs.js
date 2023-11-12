import config from "~/config.json"

export default defineEventHandler(async event => {
  return {
    graphs: config.graphs
  }
})