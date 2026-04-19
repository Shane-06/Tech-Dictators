import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/60 px-6 py-4 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/20 font-bold">
            DoD
          </div>
          <div>
            <p className="text-lg font-bold text-white"> Dictators of Delivery

            </p>
            <p className="text-xs font-semibold text-slate-300">Delivery prediction studio</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          <a className="text-base font-bold text-slate-200 hover:text-white transition" href="#predict">Predict</a>
          <a className="text-base font-bold text-slate-200 hover:text-white transition" href="#contact">Contact</a>
        </div>

        <button
          onClick={() => console.log("Profile clicked")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-violet-400 hover:text-white hover:bg-slate-800"
        >
          <img
            src="/profile-svgrepo-com.svg"
            alt="profile"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
