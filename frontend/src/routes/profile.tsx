import React from 'react';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileCards from '../components/profile/ProfileCards';

type AccessLevel = "public" | "owner" | "connected" | "notConnected";

interface ProfileProps {
    // accessLevel: AccessLevel;
    accessLevel?: AccessLevel;
}

const Profile: React.FC<ProfileProps> = ({ accessLevel = "connected" }) => {
  const profileData = {
    name: "Ucok Baba Manihot",
    banner: "",
    photo: "",
    connections: 20,
  };

  return (
    <div className="min-h-screen">
      <div className="pt-20">
        <ProfileInfo
          banner={profileData.banner}
          photo={profileData.photo}
          name={profileData.name}
          connections={profileData.connections}
          accessLevel={accessLevel}
        />
        <ProfileCards
          accessLevel={accessLevel}
        />
      </div>
    </div>
  );
};

export default Profile;
