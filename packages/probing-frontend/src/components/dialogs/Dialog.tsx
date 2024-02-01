import React, { useEffect } from 'react'
import { DialogBasic } from './DialogBasic'
import type { DialogBasicProps, DialogProps, DialogSessionExpiredProps } from '@/types/dialog.types'
import { DialogError } from './DialogError'
import { useDialogStore } from '@/stores'
import { ErrorBoundary } from 'react-error-boundary'
import { DialogSessionExpired } from './DialogSessionExpired'

function match<T>(
  onBasic: (props: DialogBasicProps) => T,
  onShowSessionExpired: (props: DialogSessionExpiredProps) => T
) {
  return (props: DialogProps) => {
    switch (props.type) {
      case 'basic':
        return onBasic(props)
      case 'sessionExpired':
        return onShowSessionExpired(props)
    }
  }
}

const _Dialog = match(
  (props) => <DialogBasic {...props} />,
  (props) => <DialogSessionExpired {...props} />
)

export const Dialog: React.FC = () => {
  const dialog = useDialogStore((state) => state.dialog)
  useEffect(() => {
    console.log(dialog)
  }, [dialog])
  if (!dialog) return null

  return (
    <>
      <ErrorBoundary FallbackComponent={DialogError}>
        <_Dialog {...dialog} />
      </ErrorBoundary>
    </>
  )
}
