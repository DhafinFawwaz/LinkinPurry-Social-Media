import React from 'react';
import EditIcon from '../../assets/images/edit-icon.svg';
import MessageIcon from '../../assets/images/message.svg';

interface ProfileInfoProps {
  banner: string;
  name: string;
  photo: string;
  connections: number;
  accessLevel: "public" | "owner" | "connected" | "notConnected";
  onEditButtonClick?: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  banner,
  name,
  photo,
  connections,
  accessLevel,
  onEditButtonClick,
}) => {
  const isPublic = accessLevel === "public";
  const isOwner = accessLevel === "owner";
  const isConnected = accessLevel === "connected";

  return (
    <div className="bg-white border border-gray-300 rounded-lg relative">
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
        <div className="flex justify-between items-center mt-20">
          <h2 className="text-2xl font-semibold text-left">{name}</h2>
          {isOwner && (
            <button onClick={onEditButtonClick} className="p-2 bg-white hover:bg-gray-200 rounded-full">
              <img
                src={EditIcon}
                alt="Edit Icon"
                className="w-[24px] h-[24px]"
              />
            </button>
          )}
        </div>
        
        {/* <p className="text-left text-gray-600">{description}</p> */}
        <p className="text-left text-gray-700 font-medium mt-2">
          {connections} connections
        </p>
        
        {/* Buttons */}
        {!isPublic && (
          <div className="mt-4 space-y-2">
            {!isOwner && isConnected && (
              <div className='flex flex-row space-x-2'>
                <button className="flex items-center bg-blue_primary text-white font-semibold py-2 px-6 rounded-full hover:bg-blue_hover">
                  <img
                    src={MessageIcon}
                    alt="Message Icon"
                    className="w-[16px] h-[16px] mr-2"
                  />
                  Message
                </button>
                <button className="bg-white text-black_primary font-semibold py-2 px-6 rounded-full border border-black_primary hover:bg-white_hover ">
                  Disconnect
                </button>
              </div>
            )}
            {!isOwner && !isConnected && (
              <>
                <button className="bg-blue_primary text-white font-semibold py-2 px-6 rounded-full hover:bg-blue_hover">
                  Connect
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
