import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/' })
    }

    if (!context.auth.subscription) {
      throw redirect({
        to: '/',
        // Go to the pricing section of the home page
        // hash: 'pricing',
        // hashScrollIntoView: true,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
