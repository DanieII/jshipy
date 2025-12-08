import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { useAuth } from '@/context/auth-context'
import { useAppForm } from '@/context/form-context'
import { getAuthErrors } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

const formSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const auth = useAuth()
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: formSchema,
      onSubmitAsync: async ({ value: data }) => {
        const result = await auth.login(data.email, data.password)

        if (result.errors) {
          return getAuthErrors(result.errors)
        }

        navigate({ to: '/' })
      },
    },
  })

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
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
              {(field) => (
                <field.TextField
                  label="Email"
                  description="We'll use this to contact you. We will not share your email
                with anyone else."
                  type="email"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label="Password"
                  description="Must be at least 8 characters long."
                  type="password"
                />
              )}
            </form.AppField>
            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  label="Confirm Password"
                  description="Please confirm your password."
                  type="password"
                />
              )}
            </form.AppField>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
