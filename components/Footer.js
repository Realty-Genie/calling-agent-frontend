import Link from 'next/link';
import { Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'API', href: '/api-docs' },
            { label: 'Integrations', href: '#integrations' },
        ],
        company: [
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
            { label: 'Contact', href: '/contact' },
        ],
        legal: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Security', href: '/security' },
        ],
    };

    return (
        <footer className="bg-[#0F172A] text-white py-16 relative z-10">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="text-2xl font-grotesk font-bold tracking-tight mb-4">
                            CallGenie
                        </div>
                        <p className="text-gray-400 font-grotesk text-sm leading-relaxed max-w-sm mb-6">
                            AI-powered voice agents that automate your lead qualification and help you close more deals.
                        </p>
                        <Link
                            href="https://linkedin.com/company/callgenie"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <Linkedin className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-grotesk font-semibold text-sm mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 font-grotesk text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-grotesk font-semibold text-sm mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 font-grotesk text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-grotesk font-semibold text-sm mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 font-grotesk text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 font-grotesk text-sm">
                        © {currentYear} CallGenie. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 font-grotesk text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
