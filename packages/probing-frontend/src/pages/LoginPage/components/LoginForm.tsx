import { Box, Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField as MUITextField } from '@mui/material'
import { InputWrapper } from '@/components/shared/InputWrapper'
import { useNavigate } from '@/router'
import { AuthHooks } from '@/api/auth/auth.hooks'
import { passwordRules } from '@/config/constants'
import React from 'react'

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })
  const { mutate: login } = AuthHooks.useLogin()

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<{ username: string; password: string }>({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = (data: { username: string; password: string }) => {
    login(data, {
      onSuccess() {
        navigate('MONITORING_E_SERVICE_LIST')
      },
    })
  }

  return (
    <Box noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['username'] as { message: string }}>
        <MUITextField
          id="username"
          label={t('username')}
          required={true}
          autoComplete="username"
          {...register('username', {
            pattern: { value: passwordRules.email, message: t('emailPattern') },
          })}
        ></MUITextField>
      </InputWrapper>
      <InputWrapper error={errors['password'] as { message: string }}>
        <MUITextField
          id="password"
          label={t('password')}
          autoComplete="password"
          type="password"
          required={true}
          {...register('password', { required: true || t('fieldRequired') })}
        ></MUITextField>
      </InputWrapper>
      <Button disabled={!isValid} variant="contained" type="submit" size="medium">
        {t('signIn')}
      </Button>
    </Box>
  )
}
