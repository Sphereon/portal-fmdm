import appConfig from '../../app.config'
import {
  AggregationResult,
  formatGraphQLResults,
  getResults
} from '@components/Search/utils'

export const getChainIds = async (): Promise<number[]> => {
  const { chainIds } = appConfig
  return chainIds.filter((id) => id !== 3 && id !== 4)
}

const resolvers = {
  Query: {
    aggregations: async (): Promise<AggregationResult[]> => {
      const results = await getResults(
        {
          faceted: true,
          offset: '0'
        },
        await getChainIds()
      )
      return formatGraphQLResults(results)
    }
  }
}

export default resolvers