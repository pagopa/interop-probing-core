import { Button, Paper } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField as MUITextField } from '@mui/material'
import { InputWrapper } from '@/components/shared/InputWrapper'
import { useNavigate } from '@/router'
import { passwordRules } from '@/config/constants'
import { AuthHooks } from '@/hooks/auth.hooks'

export const LoginForm = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })
  const { mutate: doLogin } = AuthHooks.useLogin()
  const { refetch } = AuthHooks.useToken()

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
    doLogin(
      { ...data },
      {
        onSuccess(data) {
          console.log('RESULT', data)
          refetch()
          navigate('HOME')
        },
        onError(err) {
          console.log('ERRORE', err)
        },
      }
    )
  }

  return (
    <Paper noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['username'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2, my: 2 }}
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
