import { useAppForm } from '@/context/form-context'
import { apiFetch } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/_accounts/password/reset/')({
  component: RouteComponent,
})

const formSchema = z.object({
  email: z.email(),
})

function RouteComponent() {
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: formSchema,
      onSubmitAsync: async ({ value: data }) => {
        await apiFetch('accounts/_allauth/browser/v1/auth/password/request', {
          method: 'POST',
          body: JSON.stringify({ email: data.email }),
        })
      },
    },
  })

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you instructions to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.AppField name="email">
                  {(field) => <field.TextField label="Email" type="email" />}
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
