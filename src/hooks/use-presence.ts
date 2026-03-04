'use client';

import { useEffect, useState } from 'react';

interface PresenceUser {
  email: string;
  id: string;
  image?: string | null;
  lastSeen: Date;
  name: string;
}

export function usePresence(workspaceId?: string) {
  const [onlineUsers, _setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
  }, [workspaceId]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length
  };
}
