import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Spinner } from './ui/spinner'
import { useNavigate } from '@tanstack/react-router'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const result = await apiFetch('subscriptions/checkout/', {
        method: 'POST',
        body: JSON.stringify({ price_id: priceId }),
      })

      if (result.error) {
        navigate({ to: '/login' })
      }

      return result.data as { url: string }
    },
    onSuccess: (data) => {
      navigate({ href: data.url })
    },
  })

  return (
    <Button disabled={isPending} onClick={() => mutate()}>
      {isPending ? <Spinner /> : 'Subscribe'}
    </Button>
  )
}
