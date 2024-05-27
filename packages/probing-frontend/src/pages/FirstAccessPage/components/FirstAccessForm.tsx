import { Box, Button, Stack } from '@mui/material'
import type { FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField as MUITextField } from '@mui/material'
import { InputWrapper } from '@/components/shared/InputWrapper'
import { passwordRules } from '@/config/constants'
import { AuthHooks } from '@/api/auth/auth.hooks'
import { useNavigate } from '@/router'

export const FirstAccessForm: React.FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'firstAccessForm',
  })
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(window.location.hash.substring(1))
  const code = queryParams.get('code')
  const username = queryParams.get('username')
  const { mutate: passwordReset } = AuthHooks.usePasswordReset()

  const {
    register,
    formState: { errors },
    watch,
    handleSubmit,
  } = useForm({ defaultValues: { newPassword: '', newPasswordConfirm: '' }, mode: 'onChange' })

  const onSubmit = (data: FieldValues) => {
    if (code && username) {
      passwordReset(
        { username, code, newPassword: data.newPasswordConfirm },
        {
          onSuccess() {
            navigate('PASSWORD_UPDATED')
          },
        }
      )
    }
  }

  const newPasswordValidators = {
    required: { value: true, message: t('fieldRequired') },
    minLength: { value: passwordRules.minLength, message: t('passwordLengthError') },
    validate: {
      hasLowerCase: (value: string) =>
        passwordRules.hasLowerCase.test(value) || t('passwordPatternError'),
      hasUpperCase: (value: string) =>
        passwordRules.hasUpperCase.test(value) || t('passwordPatternError'),
      hasDigit: (value: string) => passwordRules.hasDigit.test(value) || t('passwordPatternError'),
      hasSpecialChar: (value: string) =>
        passwordRules.hasSpecialChar.test(value) || t('passwordPatternError'),
    },
  }

  return (
    <Box noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['newPassword'] as { message: string }}>
        <MUITextField
          id="newPassword"
          label={t('newPassword')}
          type="password"
          required
          autoComplete="newPassword"
          {...register('newPassword', newPasswordValidators)}
        />
      </InputWrapper>
      <InputWrapper error={errors['newPasswordConfirm'] as { message: string }}>
        <MUITextField
          id="newPasswordConfirm"
          label={t('newPasswordConfirm')}
          type="password"
          required
          autoComplete="newPasswordConfirm"
          {...register('newPasswordConfirm', {
            required: { value: true, message: t('fieldRequired') },
            minLength: { value: passwordRules.minLength, message: t('passwordLengthError') },
            validate: {
              checkPasswords: (value) => watch('newPassword') === value || t('notMatching'),
            },
          })}
        />
      </InputWrapper>

      <Stack alignItems="center">
        <Button variant="contained" type="submit">
          {t('signIn')}
        </Button>
      </Stack>
    </Box>
  )
}
