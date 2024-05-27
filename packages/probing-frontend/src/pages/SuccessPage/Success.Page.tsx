import { useNavigate } from '@/router'
import { Stack } from '@mui/system'
import { IllusCompleted, IllusEmailValidation } from '@pagopa/mui-italia'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SuccessElement } from './components/SuccessElement'
type SuccessPageProps = {
  parent: SuccessType
}
type SuccessType = 'EMAIL_SENT' | 'PASSWORD_UPDATED'
export type SuccessElementProps = {
  title: string
  subtitle: string
  cta: { title: string; action: () => void }
  icon: JSX.Element
}
export const SuccessPage: React.FC<SuccessPageProps> = ({ parent }) => {
  const { t } = useTranslation('common', {
    keyPrefix: parent,
  })
  const navigate = useNavigate()

  const handleSubmit = () => {
    const targetRoute = parent === 'EMAIL_SENT' ? 'MONITORING_E_SERVICE_LIST' : 'LOGIN'
    navigate(targetRoute)
  }

  return (
    <Stack
      spacing={4}
      component="main"
      sx={{
        maxWidth: '600px',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        mx: 'auto',
      }}
    >
      <SuccessElement
        title={t('title')}
        subtitle={t('subtitle')}
        cta={{ title: t('button'), action: () => handleSubmit() }}
        icon={parent === 'PASSWORD_UPDATED' ? <IllusCompleted /> : <IllusEmailValidation />}
      ></SuccessElement>
    </Stack>
  )
}
