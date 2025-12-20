import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  getPushSubscriptionStatus,
  enablePushNotifications,
  disablePushNotifications,
  isPushNotificationsEnabled,
} from '../lib/pushNotifications';

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const enabled = await isPushNotificationsEnabled();
        setIsEnabled(enabled);
      } catch (err) {
        console.error('Failed to check notification status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleToggle = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isEnabled) {
        // Disable notifications
        const result = await disablePushNotifications(userId);
        if (result) {
          setIsEnabled(false);
          setSuccess('Notifications disabled');
        } else {
          setError('Failed to disable notifications');
        }
      } else {
        // Enable notifications
        const result = await enablePushNotifications(userId);
        if (result) {
          setIsEnabled(true);
          setSuccess('Notifications enabled');
        } else {
          setError('Failed to enable notifications');
        }
      }
    } catch (err) {
      setError('An error occurred while updating notification settings');
      console.error('Notification settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Push Notifications</h3>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-softTeal" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
            </p>
            <p className="text-xs text-gray-500">
              {isEnabled
                ? 'You will receive message notifications'
                : 'You will not receive message notifications'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled
              ? 'bg-softTeal'
              : 'bg-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          {isLoading && (
            <Loader2 className="absolute h-4 w-4 animate-spin text-gray-500" />
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• You can toggle notifications anytime in settings</p>
        <p>• Notifications work even when the app is closed</p>
        <p>• Your browser must support push notifications</p>
      </div>
    </div>
  );
};
