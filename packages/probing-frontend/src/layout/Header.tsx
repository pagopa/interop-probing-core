import { Typography } from '@mui/material'
import type { ProductSwitchItem } from '@pagopa/mui-italia'
import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia'
import { useState } from 'react'
import { useNavigate } from '@/router'
const RootLink = {
  label: 'PagoPA S.p.A.',
  href: 'https://www.pagopa.it',
  ariaLabel: 'Vai al sito di PagoPA S.p.A.',
  title: 'Vai al sito di PagoPA S.p.A.',
}

export type RootLink = {}
const documentationLink = 'https://docs.pagopa.it/interoperabilita-1'
const assistanceLink = 'https://selfcare.pagopa.it/assistenza'
const productSwitchItem: ProductSwitchItem = {
  id: 'prod-interop',
  title: `Interoperabilità`,
  productUrl: '',
  linkType: 'internal',
}
export const Header = () => {
  const [logged, setLogged] = useState<boolean>(false)
  const navigate = useNavigate()
  const handleLogin = () => {
    {
      navigate('LOGIN')
    }
  }
  const user = logged
    ? {
        id: '123',
        name: 'Diego',
        surname: 'Longo',
        email: 'diego.longo@pagopa.it',
      }
    : undefined
  return (
    <header>
      <HeaderAccount
        rootLink={RootLink}
        loggedUser={user}
        onLogin={() => handleLogin()}
        onLogout={() => {
          setLogged(false)
        }}
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
