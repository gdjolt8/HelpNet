import React, { MouseEventHandler } from 'react';
import Loading from './Loading';

const FollowButton = ({followUser, isFollowing, loading}: { followUser: MouseEventHandler<HTMLElement>, isFollowing: boolean, loading: boolean }) => {
  return (
    <button
    onClick={followUser}
    className={`rounded-md ${isFollowing ? "bg-red-600 hover:bg-rate-400" : "bg-blue-600 hover:bg-blue-400"} px-4 py-2 text-white font-bold`}
  >
    {loading ? <Loading /> : isFollowing ? "Unfollow" : "Follow"}
  </button>
  );
}

export default FollowButton;