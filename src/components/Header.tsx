import { useNavigate } from "react-router-dom";

interface HeaderProps {
  handleLogout: () => void;
}

export default function Header({ handleLogout }: HeaderProps) {
  const navigate = useNavigate();

  const goToCreatePost = () => {
    navigate("/create-post");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Brand */}
      <div
        className="text-2xl font-bold text-indigo-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        CollabEvent
      </div>

      {/* Menu */}
      <ul className="flex gap-6 text-gray-700 font-semibold items-center">
        <li
          onClick={() => navigate("/dashboard")}
          className="hover:text-indigo-600 cursor-pointer transition"
        >
          Home
        </li>

        <li
          onClick={() => navigate("/message")}
          className="hover:text-indigo-600 cursor-pointer transition"
        >
          Chat
        </li>

        <li
          onClick={goToCreatePost}
          className="hover:text-indigo-600 cursor-pointer transition"
        >
          Post an Event
        </li>

        <li
          onClick={() => navigate("/myprofile")}
          className="hover:text-indigo-600 cursor-pointer transition"
        >
          Profile
        </li>

        <li
          onClick={() => navigate("/setting")}
          className="hover:text-indigo-600 cursor-pointer transition"
        >
          Settings
        </li>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition"
        >
          Logout
        </button>
      </ul>
    </nav>
  );
}
