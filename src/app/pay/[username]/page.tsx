import { PaymentProfileClient } from './PaymentProfileClient'

interface PageProps {
  params: {
    username: string
  }
}

export default function PaymentProfilePage({ params }: PageProps) {
  return <PaymentProfileClient username={params.username} />
}