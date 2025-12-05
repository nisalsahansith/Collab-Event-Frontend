export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Left Section */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-white">CollabEvent</h2>
          <p className="text-gray-400 text-sm mt-1">
            Connecting people through collaboration and creativity.
          </p>
        </div>

        {/* Center Links */}
        <ul className="flex gap-6 text-gray-400 text-sm">
          <li className="hover:text-white cursor-pointer transition">Home</li>
          <li className="hover:text-white cursor-pointer transition">Events</li>
          <li className="hover:text-white cursor-pointer transition">Chat</li>
          <li className="hover:text-white cursor-pointer transition">About</li>
          <li className="hover:text-white cursor-pointer transition">Contact</li>
        </ul>

        {/* Copyright */}
        <div className="text-gray-500 text-sm text-center md:text-right">
          © {new Date().getFullYear()} CollabEvent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
