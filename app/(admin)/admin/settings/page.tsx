import { getCurrentUser } from "@/app/api/auth/actions";
import { ProfilePage } from "@/components/dashboard/profile-page";

export default async function AdminSettingsRoute() {
  const user = await getCurrentUser();
  return <ProfilePage userId={user?.id || ""} />;
}
