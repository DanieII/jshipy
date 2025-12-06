import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_accounts')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/' })
    }
  },
})
