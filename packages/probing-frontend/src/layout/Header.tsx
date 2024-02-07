import type { ProductSwitchItem } from '@pagopa/mui-italia'
import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia'
import { useNavigate } from '@/router'
import { AuthHooks } from '@/hooks/auth.hooks'
import type {
  RefetchOptions,
  RefetchQueryFilters,
  QueryObserverResult,
} from '@tanstack/react-query'
const RootLink = {
  label: 'PagoPA S.p.A.',
  href: 'https://www.pagopa.it',
  ariaLabel: 'Vai al sito di PagoPA S.p.A.',
  title: 'Vai al sito di PagoPA S.p.A.',
}

const documentationLink = 'https://docs.pagopa.it/interoperabilita-1'
const assistanceLink = 'https://selfcare.pagopa.it/assistenza'
const productSwitchItem: ProductSwitchItem = {
  id: 'prod-interop',
  title: `Interoperabilità`,
  productUrl: '',
  linkType: 'internal',
}
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
  const user = jwt
    ? {
        id: '123',
        name: 'Diego',
        surname: 'Longo',
        email: 'diego.longo@pagopa.it',
      }
    : false

  const handleLogout = () => {
    logout(undefined, {
      onSuccess(data) {
        console.log('OK', data), refetch()
      },
    })
  }
  return (
    <header>
      <HeaderAccount
        rootLink={RootLink}
        loggedUser={user}
        onLogin={() => handleLogin()}
        onLogout={() => handleLogout()}
        onAssistanceClick={() => {
          window.open(assistanceLink, '_blank')
        }}
        onDocumentationClick={() => {
          window.open(documentationLink, '_blank')
        }}
      />
      <HeaderProduct key={'124u218ih'} productsList={[productSwitchItem]} />
    </header>
  )
}
