import React from 'react';
import EditIcon from '../../assets/images/edit-icon.svg';

interface ProfileDetailsProps {
  accessLevel: "owner" | "connected" | "notConnected" | "public";
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  accessLevel,
}) => {
  const isPublic = accessLevel === "public";
  const isOwner = accessLevel === "owner";
  const isConnected = accessLevel === "connected";

  return (
    <div className="mb-6 mx-80">
      {!isPublic && (
        <>
          {/* Postingan relevan?*/}
          {(isOwner || isConnected) && (
            <div className="bg-white border border-gray-300 rounded-lg relative mt-4 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Post</h3>
                {isOwner && (
                  <button className="p-2 bg-white hover:bg-gray-200 rounded-full">
                    <img
                      src={EditIcon}
                      alt="Edit Icon"
                      className="w-[24px] h-[24px]"
                    />
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                Postingan relevan goes here.... (dinamis kah?)
              </p>
            </div>
          )}

          {/* Experience Card */}
          <div className="bg-white border border-gray-300 rounded-lg relative mt-4 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Experience</h3>
              {isOwner && (
                <button className="p-2 bg-white hover:bg-gray-200 rounded-full">
                  <img
                    src={EditIcon}
                    alt="Edit Icon"
                    className="w-[24px] h-[24px]"
                  />
                </button>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              Isinya list card pengalaman kerja 
            </p>
          </div>

          {/* Skills Card (for isConnected or owner) */}
          {(isOwner || isConnected) && (
            <div className="bg-white border border-gray-300 rounded-lg relative mt-4 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Skills</h3>
                {isOwner && (
                  <button className="p-2 bg-white hover:bg-gray-200 rounded-full">
                    <img
                      src={EditIcon}
                      alt="Edit Icon"
                      className="w-[24px] h-[24px]"
                    />
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                Isinya list card keterampilan
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileDetails;
