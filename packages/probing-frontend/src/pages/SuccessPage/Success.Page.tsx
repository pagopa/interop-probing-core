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
    const targetRoute = parent === 'EMAIL_SENT' ? 'HOME' : 'LOGIN'
    navigate(targetRoute)
  }

  return (
    <Stack
      spacing={4}
      alignItems="center"
      component="main"
      my={9}
      mx={'auto'}
      sx={{ maxWidth: '600px' }}
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
