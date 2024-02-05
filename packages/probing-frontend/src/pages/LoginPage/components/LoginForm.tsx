import { Button, Paper } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField as MUITextField } from '@mui/material'
import { InputWrapper } from '@/components/shared/InputWrapper'
import { useNavigate } from '@/router'

export const LoginForm = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })
  const formMethods = useForm<{ name: string; password: string }>({
    defaultValues: {
      name: '',
      password: '',
    },
  })

  const onSubmit = (data: { name: string }) => {
    console.log(data)
    navigate('CREATE_PASSWORD')
  }

  return (
    <FormProvider {...formMethods}>
      <Paper
        elevation={16}
        variant="elevation"
        sx={{
          maxWidth: 480,
          borderRadius: 3,
          my: 2,
          p: 4,
        }}
        component="form"
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
      >
        <InputWrapper sx={{ alignItems: 'center' }}>
          <MUITextField
            sx={{ mb: 2, my: 2 }}
            id="name"
            label={t('username')}
            required={true}
            autoComplete="username"
            {...formMethods.register('name')}
          ></MUITextField>
          <MUITextField
            sx={{ mb: 2 }}
            id="password"
            label={t('password')}
            autoComplete="password"
            type="password"
            required={true}
            {...formMethods.register('password')}
          ></MUITextField>
        </InputWrapper>
        <Button
          disabled={!formMethods.formState.isValid}
          variant="contained"
          type="submit"
          sx={{ width: 95, mt: 2 }}
        >
          {t('signIn')}
        </Button>
      </Paper>
    </FormProvider>
  )
}
