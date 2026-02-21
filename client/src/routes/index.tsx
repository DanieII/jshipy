import { SubscribeButton } from '@/components/subscribe-button'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const auth = useAuth()

  return (
    <div className="flex w-full justify-center gap-4 p-4">
      {auth.user ? (
        <Button onClick={() => auth.logout()}>Sign Out</Button>
      ) : (
        <>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </>
      )}

      {/* Add each subscription price ID */}
      <SubscribeButton priceId=""></SubscribeButton>

      <Button asChild>
        <Link to="/dashboard">Dashboard</Link>
      </Button>
    </div>
  )
}
