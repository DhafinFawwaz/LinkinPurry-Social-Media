import React from 'react';

interface ProfileDetailsProps {
  accessLevel: "owner" | "connected" | "notConnected" | "public";
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  accessLevel,
}) => {
  const isOwner = accessLevel === "owner";

  return (
    // <div className="bg-white border border-gray-300 rounded-lg relative mx-60">
    <div>
      {accessLevel !== "public" && (
        <div className="bg-white border border-gray-300 rounded-lg relative mx-60 mt-4 p-6">
          <h3 className="text-lg font-semibold">Additional Info</h3>
          <p className="text-gray-600">This section is visible based on access level.</p>
        </div>
      )}

      {isOwner && (
        <div className="bg-white border border-gray-300 rounded-lg relative mx-60 mt-4 p-6">
        {/* <div className="mt-4"> */}
          <button className="bg-blue_primary text-white font-semibold py-2 px-6 rounded-full hover:bg-blue_hover">
            Edit Details
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
