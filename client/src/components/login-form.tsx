import { cn, getAuthFormErrors } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { z } from 'zod'
import { useAuth } from '@/context/auth-context'
import { useAppForm } from '@/context/form-context'
import { useNavigate, Link } from '@tanstack/react-router'

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const auth = useAuth()
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
      onSubmitAsync: async ({ value: data }) => {
        const result = await auth.login(data.email, data.password)
        const errors = getAuthFormErrors(result.errors)

        if (errors) return errors

        navigate({ to: '/' })
      },
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              <div className="space-y-2">
                <form.AppField name="password">
                  {(field) => (
                    <field.TextField label="Password" type="password" />
                  )}
                </form.AppField>
                <Link
                  to="/password/reset"
                  className="block text-center text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Field>
                <Button type="submit">Login</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => auth.redirectToProvider('google', 'login')}
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
