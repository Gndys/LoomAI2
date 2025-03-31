"use client"
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { useRef, useState, useEffect } from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

export default function Home() {
  // Refs for the tech stack icons for animated beams
  const containerRef = useRef<HTMLDivElement>(null);
  const nextJsRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const postgresRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const reactRef = useRef<HTMLDivElement>(null);
  const tailwindRef = useRef<HTMLDivElement>(null);

  // State to control when beams appear (after component mounts)
  const [showBeams, setShowBeams] = useState(false);

  useEffect(() => {
    setShowBeams(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] bg-repeat opacity-70"></div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="w-full">
            <Image
              src="/patterns/wave.svg"
              alt=""
              width={1440}
              height={120}
              className="w-full h-auto"
            />
          </div>
        </div>
        <div className="absolute top-20 right-0 -mr-20 hidden lg:block">
          <Image
            src="/patterns/blob.svg"
            alt=""
            width={500}
            height={500}
            className="w-[500px] h-[500px] opacity-50"
          />
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Ship Faster, Grow Smarter
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  The all-in-one shipping platform to help your business deliver exceptional customer experiences.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 border-0 text-white">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="px-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <CheckIcon className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs md:text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckIcon className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs md:text-sm text-gray-600">14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">
              <div className="w-full overflow-hidden rounded-xl bg-white shadow-xl border border-blue-100 aspect-square lg:aspect-[4/3] relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 z-0 opacity-75"></div>
                
                {/* Tech Stack Integration with Animated Beams */}
                <div ref={containerRef} className="relative w-full h-full p-8 flex items-center justify-center">
                  {/* Center icon - ShipEasy */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">S</div>
                  </div>

                  {/* Next.js */}
                  <div ref={nextJsRef} className="absolute top-4 left-1/4 bg-white p-3 rounded-full shadow-md z-10">
                    <Image src="/tech/nextjs.svg" alt="Next.js" width={40} height={40} />
                  </div>

                  {/* TypeScript */}
                  <div ref={tsRef} className="absolute top-4 right-1/4 bg-white p-3 rounded-full shadow-md z-10">
                    <Image src="/tech/typescript.svg" alt="TypeScript" width={40} height={40} />
                  </div>

                  {/* PostgreSQL */}
                  <div ref={postgresRef} className="absolute bottom-4 left-1/4 bg-white p-3 rounded-full shadow-md z-10">
                    <Image src="/tech/postgresql.svg" alt="PostgreSQL" width={40} height={40} />
                  </div>

                  {/* Auth */}
                  <div ref={authRef} className="absolute bottom-4 right-1/4 bg-white p-3 rounded-full shadow-md z-10">
                    <Image src="/tech/auth.svg" alt="Authentication" width={40} height={40} />
                  </div>

                  {/* React */}
                  <div ref={reactRef} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-md z-10">
                    <Image src="/tech/react.svg" alt="React" width={40} height={40} />
                  </div>

                  {/* Tailwind CSS */}
                  <div ref={tailwindRef} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-md z-10">
                    <Image src="/tech/tailwind.svg" alt="Tailwind CSS" width={40} height={40} />
                  </div>

                  {/* Animated Beams */}
                  {showBeams && (
                    <>
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={nextJsRef}
                        toRef={containerRef}
                        endXOffset={0}
                        endYOffset={0}
                        curvature={0.5}
                        duration={2}
                        delay={0}
                        pathColor="blue"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                      />
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={tsRef}
                        toRef={containerRef}
                        endXOffset={0}
                        endYOffset={0}
                        curvature={0.5}
                        duration={2}
                        delay={0.2}
                        pathColor="blue"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                      />
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={postgresRef}
                        toRef={containerRef}
                        endXOffset={0}
                        endYOffset={0}
                        curvature={0.5}
                        duration={2}
                        delay={0.4}
                        pathColor="blue"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                      />
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={authRef}
                        toRef={containerRef}
                        endXOffset={0}
                        endYOffset={0}
                        curvature={0.5}
                        duration={2}
                        delay={0.6}
                        pathColor="blue"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                      />
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={reactRef}
                        toRef={containerRef}
                        endXOffset={0}
                        endYOffset={0}
                        curvature={0.5}
                        duration={2}
                        delay={0.8}
                        pathColor="blue"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                      />
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={tailwindRef}
                        toRef={containerRef}
                        endXOffset={0}
                        endYOffset={0}
                        curvature={0.5}
                        duration={2}
                        delay={1}
                        pathColor="blue"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Using Bento Grid */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white relative">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-sm font-medium">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Key Features</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Everything you need to ship with confidence</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform provides all the tools you need to manage your shipping process from start to finish.
              </p>
            </div>
          </div>
          
          <BentoGrid className="max-w-6xl mx-auto grid-cols-6 gap-4">
            {features.map((feature, i) => (
              <BentoCard
                key={i}
                name={feature.title}
                description={feature.description}
                Icon={feature.iconComponent}
                className={featureLayouts[i % featureLayouts.length]}
                href={feature.href || "#"}
                cta={feature.cta || "Learn more"}
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
                }
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] bg-repeat opacity-40"></div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-sm font-medium">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Testimonials</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Trusted by thousands of businesses</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See what our customers have to say about their experience with ShipEasy.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 lg:mt-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col justify-between space-y-4 rounded-xl border border-indigo-100 p-6 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-indigo-500" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-indigo-700">
                    <span className="text-xs font-medium">{testimonial.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] bg-repeat opacity-15"></div>
        <div className="absolute top-0 -right-20">
          <Image
            src="/patterns/blob.svg"
            alt=""
            width={400}
            height={400}
            className="w-[400px] h-[400px] opacity-25"
          />
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to transform your shipping process?</h2>
              <p className="max-w-[600px] text-indigo-100 md:text-xl/relaxed">
                Join thousands of businesses that trust ShipEasy with their shipping and logistics.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-8 bg-white text-blue-600 hover:bg-blue-50">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 border-white/30 text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-6 bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold mr-2">S</div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">ShipEasy</span>
            </div>
            <div className="text-sm text-indigo-200">
              © {new Date().getFullYear()} ShipEasy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Icons
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}

function HeadphonesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// Content Data
const featureLayouts = [
  "col-span-2", 
  "col-span-2", 
  "col-span-2",
  "col-span-3", 
  "col-span-1", 
  "col-span-2"
];

const features = [
  {
    iconComponent: BoxIcon,
    icon: <BoxIcon className="h-6 w-6" />,
    title: "Easy Shipping",
    description: "Print shipping labels, schedule pickups, and track packages all in one place.",
    href: "/features/shipping",
    cta: "Ship now"
  },
  {
    iconComponent: TruckIcon,
    icon: <TruckIcon className="h-6 w-6" />,
    title: "Multi-Carrier Support",
    description: "Compare rates and services from top carriers to find the best shipping options.",
    href: "/features/carriers",
    cta: "View carriers"
  },
  {
    iconComponent: BarChartIcon,
    icon: <BarChartIcon className="h-6 w-6" />,
    title: "Advanced Analytics",
    description: "Track shipping costs, delivery performance, and customer satisfaction.",
    href: "/features/analytics",
    cta: "See insights"
  },
  {
    iconComponent: GlobeIcon,
    icon: <GlobeIcon className="h-6 w-6" />,
    title: "Global Shipping",
    description: "Ship to over 220 countries and territories with our international shipping solutions.",
    href: "/features/global",
    cta: "Go global"
  },
  {
    iconComponent: HeadphonesIcon,
    icon: <HeadphonesIcon className="h-6 w-6" />,
    title: "24/7 Support",
    description: "Get help when you need it with our dedicated customer support team.",
    href: "/support",
    cta: "Contact support"
  },
  {
    iconComponent: CheckIcon,
    icon: <CheckIcon className="h-6 w-6" />,
    title: "Order Management",
    description: "Streamline your order fulfillment process from checkout to delivery.",
    href: "/features/management",
    cta: "Manage orders"
  },
];

const testimonials = [
  {
    quote: "ShipEasy has transformed how we handle shipping. We've reduced costs by 23% and improved delivery times.",
    author: "Alex Thompson",
    role: "E-commerce Director, GadgetWorld"
  },
  {
    quote: "The analytics dashboard gives us insights we never had before. Now we can make data-driven decisions about our shipping strategy.",
    author: "Sarah Johnson",
    role: "Operations Manager, FashionFast"
  },
  {
    quote: "Customer satisfaction has increased dramatically since we started using ShipEasy. The tracking features are a game-changer.",
    author: "Michael Chen",
    role: "Founder, OrganicMarket"
  }
];
