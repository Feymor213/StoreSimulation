import { getAuthenticatedUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AuthRecord, RecordModel } from 'pocketbase';
import { EditableProfileImage, UpdateUserInfoForm, ChangePasswordForm } from './client';
import React from 'react';

const ProfilePage = async () => {

  const user: AuthRecord = await getAuthenticatedUser();

  if (!user) {
    return redirect('/login');
  }

  const loggedIn = !!user;

  const avatarImage: string = loggedIn ? user.avatar : '/public/images/defaultAvatar.svg';
  const avatarName: string = loggedIn ? user.name : 'Guest';

  return (
    <div className='m-auto w-1/2 flex flex-col items-center gap-8'>
      <EditableProfileImage loggedIn={loggedIn} avatarImage={avatarImage} avatarName={avatarName} />
      <h1>Profile Page</h1>
      <p>Welcome to your profile!</p>
      <UpdateUserInfoForm user={user} />
      <ChangePasswordForm user={user} />
    </div>
  );
};

export default ProfilePage;