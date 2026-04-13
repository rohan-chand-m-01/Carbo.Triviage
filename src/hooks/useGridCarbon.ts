import useSWR from 'swr'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export function useGridCarbon(zone: string) {
  const { data, error, isLoading, mutate } = useSWR(
    zone ? `/api/carbon/intensity?zone=${zone}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // 5 minutes
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}
