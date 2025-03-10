'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC, useState, useEffect } from 'react';

const Home: FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const stats = [
        { number: '10K+', label: 'Active Users' },
        { number: '1M+', label: 'Photos Organized' },
        { number: '99.9%', label: 'Accuracy Rate' },
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Professional Photographer",
            content: "AI Photobooth has revolutionized how I organize my client photos. The face verification feature is incredibly accurate!",
            image: "/testimonial1.jpg"
        },
        {
            name: "Mike Chen",
            role: "Family Organizer",
            content: "Managing family photos has never been easier. The AI automatically sorts everyone's pictures perfectly.",
            image: "/testimonial2.jpg"
        },
        {
            name: "Emma Davis",
            role: "Event Planner",
            content: "This platform has made sharing event photos with clients secure and professional. Absolutely love it!",
            image: "/testimonial3.jpg"
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-70" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-3xl" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mt-36 text-gray-900 sm:text-6xl">
                        Welcome to AI Photobooth
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                        Organize and secure your photos with advanced face verification technology.
                        Create beautiful albums and share memories with confidence.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            href="/sign-in"
                            className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transform hover:scale-105 transition-all"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/find"
                            className="text-lg font-semibold leading-6 text-gray-900 hover:text-gray-700 flex items-center group"
                        >
                            Learn more <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-blue-600">{stat.number}</div>
                                <div className="mt-2 text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Powerful Features</h2>
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col items-start group hover:transform hover:scale-105 transition-all p-6 rounded-xl hover:bg-white hover:shadow-xl">
                        <div className="rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Smart Album Organization</h3>
                        <p className="mt-2 text-gray-600">
                            Automatically organize your photos into albums using AI-powered face recognition technology.
                        </p>
                    </div>

                    <div className="flex flex-col items-start group hover:transform hover:scale-105 transition-all p-6 rounded-xl hover:bg-white hover:shadow-xl">
                        <div className="rounded-lg bg-green-100 p-3 group-hover:bg-green-200 transition-colors">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure Face Verification</h3>
                        <p className="mt-2 text-gray-600">
                            Advanced face verification ensures your photos are accessible only to authorized users.
                        </p>
                    </div>

                    <div className="flex flex-col items-start group hover:transform hover:scale-105 transition-all p-6 rounded-xl hover:bg-white hover:shadow-xl">
                        <div className="rounded-lg bg-purple-100 p-3 group-hover:bg-purple-200 transition-colors">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Easy Sharing</h3>
                        <p className="mt-2 text-gray-600">
                            Share your albums with family and friends while maintaining control over privacy settings.
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">What Our Users Say</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">{testimonial.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to get started?
                    </h2>
                    <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                        Join thousands of users who trust AI Photobooth for their photo management needs.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/sign-in"
                            className="rounded-md bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transform hover:scale-105 transition-all"
                        >
                            Create your account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">AI Photobooth</h3>
                            <p className="text-gray-400">Making photo organization smarter and more secure.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Features</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Smart Organization</li>
                                <li>Face Verification</li>
                                <li>Secure Sharing</li>
                                <li>Cloud Storage</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>About Us</li>
                                <li>Blog</li>
                                <li>Careers</li>
                                <li>Contact</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                                <li>Cookie Policy</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>© {new Date().getFullYear()} AI Photobooth. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}

export default Home;
