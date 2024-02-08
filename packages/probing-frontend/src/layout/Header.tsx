import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia'
import { useNavigate } from '@/router'
import { AuthHooks } from '@/api/auth/auth.hooks'
import { RootLink, assistanceLink, documentationLink, productSwitchItem } from '@/config/constants'
import { useJwt } from '@/hooks/useJwt'

export const Header = () => {
  const { mutate: logout } = AuthHooks.useLogout()
  const navigate = useNavigate()
  const handleLogin = () => {
    {
      navigate('LOGIN')
    }
  }

  const jwt = useJwt()

  const handleLogout = () => {
    logout(void 0, {
      onSuccess(data) {
        console.log('OK', data)
      },
    })
  }
  return (
    <header>
      <HeaderAccount
        rootLink={RootLink}
        loggedUser={jwt ? { id: jwt.email } : false}
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
