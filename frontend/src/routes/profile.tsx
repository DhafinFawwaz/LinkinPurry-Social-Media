import React from 'react';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileDetails from '../components/profile/ProfileDetails';

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
      <div className="">
        <ProfileCard
          banner={profileData.banner}
          photo={profileData.photo}
          name={profileData.name}
          description={profileData.description}
          connections={profileData.connections}
          accessLevel={accessLevel}
        />
        <ProfileDetails
          accessLevel={accessLevel}
        />
      </div>
    </div>
  );
};

export default Profile;
