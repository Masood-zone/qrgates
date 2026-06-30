import { Suspense } from "react"
import { AttendeeManagementPage } from "@/components/organizer/attendee-management-page"
import { PageLoader } from "@/components/ui/loader"

interface AttendeePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventAttendees({ params }: AttendeePageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<PageLoader />}>
      <AttendeeManagementPage eventId={id} />
    </Suspense>
  )
}
