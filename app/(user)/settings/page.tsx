import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "./profile-form"
import { SocialAccounts } from "./social-accounts"
import { getUserSubscription } from "@/lib/server-utils"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch the user's subscription
  const subscription = await getUserSubscription(session.user.id ?? '')

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Photo</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Remove photo
                  </Button>
                  <Button size="sm">Change photo</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subscription Status</h3>
              <div className="flex-1">
                <p className="font-medium">{subscription?.subscription?.plan || "Free Plan"}</p>
                <p className="text-sm text-gray-500">
                {subscription
                  ? "You are currently on a paid subscription"
                  : "Upgrade to unlock premium features"}
                </p>
              </div>
              <Button
                variant={subscription ? "outline" : "default"}
                size="sm"
              >
                {subscription ? "Manage Plan" : "Upgrade"}
              </Button>
              </div>

            <ProfileForm user={session.user} />

            <SocialAccounts user={session.user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

