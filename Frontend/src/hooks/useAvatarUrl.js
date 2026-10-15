import { useState, useEffect } from 'react';
import { getAvatarUrl, initAvatarPosters } from '../utils/avatar';

export function useAvatarUrl(user) {
  const [url, setUrl] = useState(() => getAvatarUrl(user));

  useEffect(() => {
    let active = true;

    initAvatarPosters().then(() => {
      if (active) setUrl(getAvatarUrl(user));
    });

    return () => { active = false; };
  }, [user?.username, user?.avatar]);

  return url;
}
