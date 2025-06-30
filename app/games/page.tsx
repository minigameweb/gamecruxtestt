import { auth } from '@/auth';
import React from 'react';
import SubscribedGamePage from './SubscribedGamePage';
import FreeGamePage from './FreeGamePage';
import { fetchSubscription } from '@/lib/server-utils';

export default async function Page() {
    const session = await auth(); // Get the session
    const subscription = session?.user?.id ? await fetchSubscription(session.user.id) : null;

    return (
        <div>
            {subscription?.success === true ? <SubscribedGamePage /> : <FreeGamePage />}
        </div>
    );
}
