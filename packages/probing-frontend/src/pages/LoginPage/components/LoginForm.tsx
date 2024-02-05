import { Button, Paper } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField as MUITextField } from '@mui/material'
import { InputWrapper } from '@/components/shared/InputWrapper'
import { useNavigate } from '@/router'
import { passwordRules } from '@/config/constants'

export const LoginForm = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<{ name: string; password: string }>({
    defaultValues: {
      name: '',
      password: '',
    },
    mode: 'onChange',
  })

  const onSubmit = (data: { name: string }) => {
    console.log(data)
    navigate('CREATE_PASSWORD')
  }

  return (
    <Paper noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['name'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2, my: 2 }}
          id="name"
          label={t('username')}
          required={true}
          autoComplete="username"
          {...register('name', {
            pattern: { value: passwordRules.email, message: t('emailPattern') },
          })}
        ></MUITextField>
      </InputWrapper>
      <InputWrapper error={errors['password'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2 }}
          id="password"
          label={t('password')}
          autoComplete="password"
          type="password"
          required={true}
          {...register('password', { required: true || t('fieldRequired') })}
        ></MUITextField>
      </InputWrapper>
      <Button disabled={!isValid} variant="contained" type="submit" sx={{ width: 95, mt: 2 }}>
        {t('signIn')}
      </Button>
    </Paper>
  )
}
