'use client'

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { checkProvider } from "../sign-up/actions"
import { useEffect, useState } from "react"

interface SocialAccountsProps {
  user: {
    email?: string | null
  }
}

export function SocialAccounts({ user }: SocialAccountsProps) {
  const [provider, setProvider] = useState<string>("")

  useEffect(() => {
    const getProvider = async () => {
      if (user.email) {
        const result = await checkProvider(user.email)
        setProvider(result ?? "")
      }
    }
    getProvider()
  }, [user.email])

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return (
          <svg viewBox="0 0 24 24" className="h-6 w-6">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )
      case 'discord':
        return <svg className="h-6 w-6" fill="#5865F2" viewBox="0 -28.5 256 256"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z"/></svg>
      case 'credentials':
        return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z"/></svg>
    }
  }

  const getProviderName = () => {
    switch (provider) {
      case 'google':
        return 'Google'
      case 'discord':
        return 'Discord'
      case 'credentials':
        return 'Email'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Connected social account</h3>
      <p className="text-sm text-muted-foreground">
        Services that you use to log in
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getProviderIcon()}
            <div className="text-sm">
              <div className="font-medium">{getProviderName()}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}
