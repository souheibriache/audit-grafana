import { RiUser3Fill } from "react-icons/ri";
import { UserAvatarProps } from "@/lib/types/leagues";

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, fullName }) => {
  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={fullName || "User Avatar"}
      className="w-full h-full rounded-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-50">
      <RiUser3Fill className="text-4xl text-red-500" />
    </div>
  );
};

export default UserAvatar;
