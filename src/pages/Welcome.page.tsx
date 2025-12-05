import React from "react";

export default function WelcomePage() {
  return (
    <div className="w-full min-h-screen overflow-y-auto">

      {/* HERO SECTION */}
      <section
        className="relative h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-between"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* NAVBAR */}
        <nav className="relative z-20 flex justify-between items-center px-10 py-6 text-white">
          <h1 className="text-3xl font-extrabold tracking-wide">
            Collab<span className="text-indigo-400">Event</span>
          </h1>

          <div className="flex gap-6 text-lg">
            <a href="/login" className="hover:text-indigo-400 transition">
              Login
            </a>
            <a href="/signup" className="hover:text-indigo-400 transition">
              Sign Up
            </a>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 mt-20 text-white">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Create Meaningful{" "}
            <span className="text-indigo-400">Events Together</span>
          </h2>

          <p className="max-w-2xl text-slate-200 text-lg mb-10">
            A powerful platform to plan, collaborate, and manage events with
            ease. Designed for teams that want clarity, speed, and beautiful
            experiences.
          </p>

          {/* CTA Buttons — moved upward using mb-20 */}
          <div className="flex gap-6 mt-6 mb-20">
            <a
              href="/signup"
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg font-semibold text-lg transition-all"
            >
              Get Started
            </a>

            <a
              href="/login"
              className="px-10 py-3 border border-white/40 hover:bg-white/10 rounded-xl backdrop-blur-sm font-semibold text-lg transition-all"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT CARDS SECTION */}
      <section className="py-20 px-6 md:px-20 bg-white">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          About This Website
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Fast & Reliable
            </h3>
            <p className="text-gray-600">
              Our platform ensures high performance and seamless experience for
              all users.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Modern UI/UX
            </h3>
            <p className="text-gray-600">
              Designed with professional and user-friendly principles with clean
              aesthetics.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Secure & Scalable
            </h3>
            <p className="text-gray-600">
              Built with best practices to ensure data security and smooth
              scalability.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-6 md:px-20">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h4 className="text-xl font-semibold mb-3 text-white">
              Our Platform
            </h4>
            <p className="text-gray-400">
              Delivering quality, performance, and modern UI for a seamless
              experience.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">Features</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-white">Contact</h4>
            <p className="text-gray-400">Email: support@example.com</p>
            <p className="text-gray-400">Phone: +94 77 123 4567</p>
          </div>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          © 2025 All rights reserved.
        </div>
      </footer>
    </div>
  );
}
