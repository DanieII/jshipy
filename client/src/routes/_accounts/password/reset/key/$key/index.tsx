import { useAppForm } from '@/context/form-context'
import { apiFetch } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import z from 'zod'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_accounts/password/reset/key/$key/')({
  component: RouteComponent,
})

const formSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

function RouteComponent() {
  const { key } = Route.useParams()
  const navigate = useNavigate()

  const form = useAppForm({
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
    validators: {
      onSubmit: formSchema,
      onSubmitAsync: async ({ value: data }) => {
        const result = await apiFetch(
          'accounts/_allauth/browser/v1/auth/password/reset',
          {
            method: 'POST',
            body: JSON.stringify({
              key: key,
              password: data.password,
            }),
          },
        )

        if (result.error && result.status !== 401) {
          return {
            fields: {
              password: {
                message: 'Failed to reset password. Please try again.',
              },
            },
          }
        }

        navigate({ to: '/login' })
      },
    },
  })

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Set new password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.AppField name="password">
                  {(field) => (
                    <field.TextField label="New Password" type="password" />
                  )}
                </form.AppField>
                <form.AppField name="passwordConfirm">
                  {(field) => (
                    <field.TextField label="Confirm Password" type="password" />
                  )}
                </form.AppField>
                <Field>
                  <form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Spinner /> : 'Reset Password'}
                      </Button>
                    )}
                  </form.Subscribe>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
