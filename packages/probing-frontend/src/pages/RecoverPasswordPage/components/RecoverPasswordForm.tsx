import { InputWrapper } from '@/components/shared/InputWrapper'
import { passwordRules } from '@/config/constants'
import { AuthHooks } from '@/api/auth/auth.hooks'
import { useNavigate } from '@/router'
import { Box, TextField as MUITextField, Stack } from '@mui/material'
import { Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const RecoverPasswordForm: React.FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'recoverPasswordForm',
  })
  const navigate = useNavigate()
  const { mutate: passwordRecover } = AuthHooks.usePasswordRecovery()

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({ defaultValues: { email: '' } })

  const onSubmit = (data: { email: string }) => {
    passwordRecover(data.email, {
      onSuccess() {
        navigate('EMAIL_SENT')
      },
    })
  }
  return (
    <Box noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['email'] as { message: string }}>
        <MUITextField
          sx={{
            width: '480px',
            '@media (max-width: 600px)': {
              width: '100%', // Width for screens smaller than 600px
            },
          }}
          id="email"
          label={t('email')}
          required={true}
          autoComplete="email"
          {...register('email', {
            pattern: { value: passwordRules.email, message: t('emailPattern') },
          })}
        />
      </InputWrapper>
      <Stack alignItems="center">
        <Button disabled={!isValid} variant="contained" type="submit" size="medium">
          {t('send')}
        </Button>
      </Stack>
    </Box>
  )
}
