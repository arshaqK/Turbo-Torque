import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 px-6 py-10 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-center max-w-7xl mx-auto gap-10 h-screen">
        <div className="text-center md:text-left space-y-6 max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Drive Your Dream with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">Pak Wheels</span>!
          </h1>

          <p className="text-xl text-gray-700">Buy, sell, or rent cars the smart way. Fast, secure, and hassle-free.</p>

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link href="/new-cars" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl text-lg hover:opacity-90 transition">
              Browse Cars
            </Link>

            <Link href="/post-ad" className="px-6 py-3 bg-white border border-teal-600 text-teal-600 rounded-2xl text-lg hover:bg-teal-100 transition">
              Post an Ad
            </Link>
          </div>
        </div>

        <div className="w-full md:w-[500px]">
          <Image src="/haval.png" alt="Car illustration" width={500} height={500} className="w-full h-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-24 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">Why Choose Pak Wheels?</h2>

        <div className="grid md:grid-cols-3 gap-10 text-left">
          {[
            { title: "Verified Listings", desc: "We ensure all listings are verified to avoid scams and frauds.", icon: "✅" },
            { title: "Wide Range", desc: "From economy to luxury, explore thousands of cars to fit every budget.", icon: "🚗" },
            { title: "Smart Filters", desc: "Use smart filters to narrow down your choices by price, location, or features.", icon: "🔍" },
          ].map(({ title, desc, icon }, i) => (
            <div key={i} className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-24 bg-gradient-to-br from-teal-100 to-white py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">What Our Users Say</h2>

          <div className="grid md:grid-cols-3 gap-10">
            {["Best platform I’ve used for selling my car — so easy and smooth!", "I found my dream car here within days. Excellent experience!", "Posting an ad was super simple and responses were quick. Love it!"].map((quote, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow">
                <p className="italic text-gray-700">“{quote}”</p>
                <div className="mt-4 text-sm text-gray-500">- Happy Customer</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-24 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Make Your Move?</h2>
        <p className="text-lg text-gray-700 mb-8">Whether you&#39;re buying or selling, Pak Wheels has your back. Join the community today.</p>
        <Link href="/used-cars" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full text-xl hover:opacity-90 transition">
          Explore used cars
        </Link>
      </section>
    </main>
  );
}
