import React from 'react';

interface ProfileCardProps {
  banner: string;
  name: string;
  photo: string;
  description: string;
  connections: number;
  accessLevel: "public" | "owner" | "connected" | "notConnected";
  isOwner: boolean;
  isConnected: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  banner,
  name,
  photo,
  description,
  connections,
  accessLevel,
  isOwner,
  isConnected,
}) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg relative mx-60">
      {/* Banner */}
      <div className="h-48 relative">
        <img
          className="object-cover w-full h-full rounded-t-lg"
          style={{
            backgroundImage: `url(${banner || '/banner.svg'})`,
          }}
        ></img>
      </div>

      {/* Info Profil */}
      <img
        src={photo || '/jobseeker_profile.svg'}
        alt="Profile"
        className="w-32 h-32 rounded-full mx-auto absolute -mt-16 left-20 transform -translate-x-1/2 border-4 border-white"
      />
      
      <div className="px-6 pb-6">
        <h2 className="text-xl font-semibold text-left mt-20">{name}</h2>
        <p className="text-left text-gray-600">{description}</p>
        <p className="text-left text-gray-700 font-medium mt-2">
          {connections} connections
        </p>
        
        {/* Buttons */}
        <div className="mt-4 space-y-2">
          {isOwner && (
            <>
              <button className="bg-blue_primary text-white font-semibold py-2 px-6 rounded-full hover:bg-blue_hover">
                Edit Profile
              </button>
            </>
          )}
          {!isOwner && isConnected && accessLevel !== "public" && (
            <div className='flex flex-row space-x-2'>
              <button className="bg-blue_primary text-white font-semibold py-2 px-6 rounded-full hover:bg-blue_hover">
                Message
              </button>
              <button className="bg-white text-black_primary font-semibold py-2 px-6 rounded-full border border-black_primary hover:bg-white_hover ">
                Disconnect
              </button>
            </div>
          )}
          {!isOwner && !isConnected && accessLevel !== "public" && (
            <>
              <button className="bg-blue_primary text-white font-semibold py-2 px-6 rounded-full hover:bg-blue_hover">
                Connect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
