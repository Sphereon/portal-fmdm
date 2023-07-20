import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import AssetList from '@shared/AssetList'
import queryString from 'query-string'
import Filters from './Filters'
import Sort from './sort'
import {
  AggregationResult,
  formatFacetedSearchResults,
  getResults,
  updateQueryStringParameter
} from './utils'
import { useUserPreferences } from '@context/UserPreferences'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { useRouter } from 'next/router'

export default function SearchPage({
  setTotalResults,
  setTotalPagesNumber
}: {
  setTotalResults: (totalResults: number) => void
  setTotalPagesNumber: (totalPagesNumber: number) => void
}): ReactElement {
  const router = useRouter()
  const [parsed, setParsed] = useState<queryString.ParsedQuery<string>>()
  const { chainIds } = useUserPreferences()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [aggregations, setAggregations] = useState<AggregationResult[]>()
  const [loading, setLoading] = useState<boolean>()
  const [serviceType, setServiceType] = useState<string>()
  const [accessType, setAccessType] = useState<string>()
  const [complianceType, setComplianceType] = useState<string>()
  const [sortType, setSortType] = useState<string>()
  const [sortDirection, setSortDirection] = useState<string>()
  const newCancelToken = useCancelToken()

  useEffect(() => {
    const parsed = queryString.parse(location.search)
    const { sort, sortOrder, serviceType, accessType, complianceType } = parsed
    setParsed(parsed)
    setServiceType(serviceType as string)
    setAccessType(accessType as string)
    setComplianceType(complianceType as string)
    setSortDirection(sortOrder as string)
    setSortType(sort as string)
  }, [router])

  const updatePage = useCallback(
    (page: number) => {
      const { pathname, query } = router
      const newUrl = updateQueryStringParameter(
        pathname +
          '?' +
          JSON.stringify(query)
            .replace(/"|{|}/g, '')
            .replace(/:/g, '=')
            .replace(/,/g, '&'),
        'page',
        `${page}`
      )
      return router.push(newUrl)
    },
    [router]
  )

  const fetchAssets = useCallback(
    async (parsed: queryString.ParsedQuery<string>, chainIds: number[]) => {
      setLoading(true)
      setTotalResults(undefined)
      const queryResult = await getResults(parsed, chainIds, newCancelToken())
      const aggregationResult = await getResults(
        { faceted: true, offset: '0' },
        chainIds,
        newCancelToken()
      )

      setAggregations(formatFacetedSearchResults(aggregationResult))
      setQueryResult(queryResult)

      setTotalResults(queryResult?.totalResults || 0)
      setTotalPagesNumber(queryResult?.totalPages || 0)
      setLoading(false)
    },
    [newCancelToken, setTotalPagesNumber, setTotalResults]
  )
  useEffect(() => {
    if (!parsed || !queryResult) return
    const { page } = parsed
    if (queryResult.totalPages < Number(page)) updatePage(1)
  }, [parsed, queryResult, updatePage])

  useEffect(() => {
    if (!parsed || !chainIds) return
    fetchAssets(parsed, chainIds)
  }, [parsed, chainIds, newCancelToken, fetchAssets])

  return (
    <>
      <div className={styles.search}>
        <div className={styles.row}>
          <Filters
            serviceType={serviceType}
            accessType={accessType}
            complianceType={complianceType}
            setServiceType={setServiceType}
            setAccessType={setAccessType}
            setComplianceType={setComplianceType}
            addFiltersToUrl
          />
          <Sort
            sortType={sortType}
            sortDirection={sortDirection}
            setSortType={setSortType}
            setSortDirection={setSortDirection}
          />
        </div>
      </div>
      <div className={styles.results}>
        <AssetList
          assets={queryResult?.results}
          showPagination
          isLoading={loading}
          page={queryResult?.page}
          totalPages={queryResult?.totalPages}
          onPageChange={updatePage}
          showAssetViewSelector
        />
      </div>
    </>
  )
}
