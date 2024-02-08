import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse } from 'react-router-dom'
import { Button } from '@mui/material'
import { Redirect, Link, useNavigate } from '@/router'
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@/utils/errors.utils'
import type { FallbackProps } from 'react-error-boundary'
import { CodeBlock } from '@pagopa/interop-fe-commons'
import { AxiosError } from 'axios'

type UseResolveErrorReturnType = {
  title: string
  description: string
  content: JSX.Element | null
}

function useResolveError(fallbackProps: FallbackProps): UseResolveErrorReturnType {
  const { t } = useTranslation('error')
  const navigate = useNavigate()
  const { error, resetErrorBoundary } = fallbackProps

  let title, description: string | undefined
  let content: JSX.Element | null = null

  const reloadPageButton = (
    <Button size="small" variant="contained" onClick={() => window.location.reload()}>
      {t('actions.reloadPage')}
    </Button>
  )

  const retryQueryButton = (
    <Button size="small" variant="contained" onClick={resetErrorBoundary}>
      {t('actions.retry')}
    </Button>
  )

  const backToHomeButton = (
    <Link as="button" variant="contained" to="HOME">
      {t('actions.backToHome')}
    </Link>
  )

  if (error instanceof Error) {
    content = (
      <>
        {!!(import.meta.env.MODE === 'development') && (
          <CodeBlock code={error?.stack || error.message || error?.name} />
        )}
        {reloadPageButton}
      </>
    )
  }

  if ((isRouteErrorResponse(error) && error.status === 404) || error instanceof NotFoundError) {
    content = <Redirect to="NOT_FOUND" />
  }

  if (error instanceof ForbiddenError) {
    title = t('forbidden.title')
    description = t('forbidden.description')
    content = backToHomeButton
  }

  if (error instanceof AuthenticationError) {
    title = t('authentication.title')
    description = t('authentication.description')
    content = backToHomeButton
  }

  if (error instanceof AxiosError) {
    title = t('axiosError.title')
    description = t('axiosError.description')
    content = (
      <>
        {!!(import.meta.env.MODE === 'development') && <CodeBlock code={error.response ?? error} />}
        {retryQueryButton}
      </>
    )
  }

  if (!title) {
    title = t('default.title')!
  }

  if (!description) {
    description = t('default.description')!
  }

  if (error instanceof UnauthorizedError) {
    navigate('HOME')
  }

  return { title, description, content }
}

export default useResolveError
