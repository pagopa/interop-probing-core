import { Button, Paper } from '@mui/material'
import type { FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField as MUITextField } from '@mui/material'
import { InputWrapper } from '@/components/shared/InputWrapper'
import { passwordRules } from '@/config/costants'

export const FirstAccessForm = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'firstAccessForm',
  })

  const {
    register,
    formState: { errors, isValid },
    watch,
    handleSubmit,
  } = useForm()

  const onSubmit = (data: FieldValues) => {
    console.log(data, errors)
  }

  const newPasswordValidators = {
    required: { value: true, message: 'La password è obbligatoria' },
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
      onSubmit={handleSubmit(onSubmit)}
    >
      <InputWrapper error={errors['newPassword'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2, my: 2 }}
          id="newPassword"
          label={t('newPassword')}
          type="password"
          required={true}
          autoComplete="newPassword"
          {...register('newPassword', newPasswordValidators)}
        ></MUITextField>
      </InputWrapper>
      <InputWrapper error={errors['newPasswordConfirm'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2 }}
          id="newPasswordConfirm"
          label={t('newPasswordConfirm')}
          type="password"
          required={true}
          autoComplete="newPasswordConfirm"
          {...register('newPasswordConfirm', {
            required: { value: true, message: t('fieldRequired') },
            minLength: { value: passwordRules.minLength, message: t('passwordLengthError') },
            validate: {
              checkPasswords: (value) => watch('newPassword') === value,
            },
          })}
        ></MUITextField>
      </InputWrapper>

      <Button disabled={isValid} variant="contained" type="submit" sx={{ width: 95, mt: 2 }}>
        {t('signIn')}
      </Button>
    </Paper>
  )
}
