export default function WhyChooseWema() {
  const features = [
    {
      icon: "🌍",
      title: "Local Expertise",
      description:
        "Our team understands Kenya and East Africa, helping you discover the best destinations and experiences.",
    },
    {
      icon: "💰",
      title: "Best Value",
      description:
        "Enjoy carefully selected safari, hotel, flight and holiday packages at competitive prices.",
    },
    {
      icon: "🛡️",
      title: "Safe & Reliable",
      description:
        "We work to make your journey smooth, dependable and stress-free from booking to arrival.",
    },
    {
      icon: "📞",
      title: "24/7 Support",
      description:
        "Our travel team is here to assist you whenever you need help before or during your trip.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-yellow-500 font-semibold uppercase tracking-widest mb-3">
            Why Travel With Us
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-green-900">
            Why Choose WEMA Safaris?
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            We make discovering Africa easier, safer and more memorable.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-8 rounded-2xl bg-gray-50 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-green-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}