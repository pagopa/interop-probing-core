import { InputWrapper } from '@/components/shared/InputWrapper'
import { passwordRules } from '@/config/constants'
import { AuthHooks } from '@/hooks/auth.hooks'
import { Box, TextField as MUITextField } from '@mui/material'
import { Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const RecoverPasswordForm = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'recoverPasswordForm',
  })

  const { mutate: passwordRecover } = AuthHooks.usePasswordRecovery()

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({ defaultValues: { email: '' } })

  const onSubmit = (data: { email: string }) => {
    passwordRecover(data.email, {
      onSuccess(data) {
        console.log('OK', data)
      },
      onError(err) {
        console.log('ERRORE', err)
      },
    })
  }
  return (
    <Box noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['email'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2, my: 2 }}
          id="email"
          label={t('email')}
          required={true}
          autoComplete="email"
          {...register('email', {
            pattern: { value: passwordRules.email, message: t('emailPattern') },
          })}
        ></MUITextField>
      </InputWrapper>
      <Button disabled={!isValid} variant="contained" type="submit" sx={{ width: 95, mt: 2 }}>
        {t('send')}
      </Button>
    </Box>
  )
}
