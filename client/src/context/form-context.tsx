import { TextField } from '@/components/text-field'
import { createFormHookContexts, createFormHook } from '@tanstack/react-form'

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: {},
})

export { useAppForm, useFieldContext, useFormContext }
