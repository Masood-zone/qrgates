import { OrderHistoryPage } from "@/components/dashboard/order-history-page"

export const metadata = {
  title: "Order History | QuickGates",
  description: "View your order history and transaction details",
}

export default function DashboardOrdersPage() {
  return <OrderHistoryPage />
}
