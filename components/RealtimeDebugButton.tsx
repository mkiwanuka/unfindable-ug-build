import React from 'react';
import { realtimeManager } from '../lib/realtimeManager';

export const RealtimeDebugButton: React.FC = () => {
  const handleDebugClick = () => {
    console.log('----- REALTIME DEBUG -----');
    console.log('Is Ready:', realtimeManager.getReadyState());
    console.log('Is Initialized:', realtimeManager.isInitialized);
    console.log('Last Event Time:', new Date(realtimeManager.lastEventTime).toISOString());
    console.log('Subscription Count:', realtimeManager.getSubscriptionCount());
    console.log('Time since last event:', Math.round((Date.now() - realtimeManager.lastEventTime) / 1000), 'seconds');
    console.log('--------------------------');
  };

  return (
    <button
      onClick={handleDebugClick}
      className="px-3 py-2 bg-muted text-muted-foreground text-sm rounded-md hover:bg-muted/80 transition-colors"
    >
      Test Realtime
    </button>
  );
};
