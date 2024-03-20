import { useLoadingOverlay } from '@/stores'
import { delayedPromise } from '@/utils/common.utils'
import type { QueryObserverResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

export const useHandleRefetch = <T>(refetch: () => Promise<QueryObserverResult<T, unknown>>) => {
  const { showOverlay, hideOverlay } = useLoadingOverlay()
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  const handleRefetch = async () => {
    showOverlay(t('loading'))
    // We want to show the loading overlay for at least 1 second, to avoid flickering
    await delayedPromise(refetch(), 1000)
    hideOverlay()
  }

  return handleRefetch
}
