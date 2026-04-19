import Navbar from "./Components/Navbar";
import Card from "./Components/Card";

function App() {
  const scrollToSection = (sectionId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="h-screen overflow-y-auto bg-slate-950 text-slate-100">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-violet-700/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <section className="space-y-10">
            <div className="space-y-6 text-center">
              <span className="inline-flex items-center rounded-full bg-violet-500/20 px-4 py-1 text-sm font-medium text-violet-200 ring-1 ring-violet-500/30">
                AI-powered delivery intelligence
              </span>
              <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Build Smarter Delivery Predictions with Modern Analytics
              </h1>
              <p className="mx-auto max-w-2xl leading-8 text-slate-300">
                Turn order history, weather, and location data into actionable insights,
                all from one beautiful dashboard. Get faster predictions, reduce late
                deliveries, and delight every customer.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#predict"
                  onClick={scrollToSection("predict")}
                  className="inline-flex items-center justify-center rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400"
                >
                  Try prediction
                </a>
                <a
                  href="#features"
                  onClick={scrollToSection("features")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  View features
                </a>
              </div>

              <div className="grid gap-4 text-left sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <p className="text-3xl font-semibold text-white">99.8%</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Delivery accuracy trusted by teams
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <p className="text-3xl font-semibold text-white">+1,200</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Weekly predictions processed
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <p className="text-3xl font-semibold text-white">24/7</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Real-time insights and alerts
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-left">
                <h2 className="text-lg font-semibold text-white">
                  Multi-modal last-mile prediction
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Ingest historical records, geocodes, weather overlays, and traffic
                  patterns to predict failure probability before dispatch and resequence
                  the route accordingly.
                </p>
              </div>

              <div
                id="predict"
                className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 text-left shadow-2xl shadow-slate-950/40"
              >
                <Card />
              </div>
            </div>
          </section>

          <section id="features" className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="text-lg font-semibold text-white">Smart inputs</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Capture the most important delivery factors with clean forms and
                intelligent defaults.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="text-lg font-semibold text-white">Clear outcomes</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Receive concise probability results and performance guidance for every
                route.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="text-lg font-semibold text-white">Modern look</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                A polished interface built with Tailwind CSS for responsive experiences
                across desktop and mobile.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
