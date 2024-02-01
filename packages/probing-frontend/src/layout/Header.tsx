import { HeaderAccount } from '@pagopa/mui-italia'
const rootLink = {
  label: 'string',
  href: 'string',
  ariaLabel: 'string',
  title: 'string',
}
export const Header = () => {
  return (
    <>
      <HeaderAccount
        rootLink={rootLink}
        onAssistanceClick={() => false}
        onLogin={() => console.log('DO LOGIN')}
      ></HeaderAccount>
    </>
  )
}
