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
    description: "Informatics Student at Bandung Institute of Technology",
    connections: 20,
  };

  return (
    <div className="min-h-screen">
      <div className="pt-5">
        <ProfileInfo
          banner={profileData.banner}
          photo={profileData.photo}
          name={profileData.name}
          description={profileData.description}
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
