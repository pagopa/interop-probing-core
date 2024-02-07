import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia'
import { useNavigate } from '@/router'
import { AuthHooks } from '@/hooks/auth.hooks'
import type {
  RefetchOptions,
  RefetchQueryFilters,
  QueryObserverResult,
} from '@tanstack/react-query'
import { RootLink, assistanceLink, documentationLink, productSwitchItem } from '@/config/constants'

export const Header = ({
  jwt,
  refetch,
}: {
  jwt?: string | null
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<string | null, unknown>>
}) => {
  const { mutate: logout } = AuthHooks.useLogout()
  const navigate = useNavigate()
  const handleLogin = () => {
    {
      navigate('LOGIN')
    }
  }

  const handleLogout = () => {
    logout(void 0, {
      onSuccess(data) {
        console.log('OK', data), refetch()
      },
    })
  }
  return (
    <header>
      <HeaderAccount
        rootLink={RootLink}
        loggedUser={jwt ? { id: jwt } : false}
        onLogin={() => handleLogin()}
        onLogout={() => handleLogout()}
        onAssistanceClick={() => {
          window.open(assistanceLink, '_blank')
        }}
        onDocumentationClick={() => {
          window.open(documentationLink, '_blank')
        }}
      />
      <HeaderProduct key={productSwitchItem.id} productsList={[productSwitchItem]} />
    </header>
  )
}
