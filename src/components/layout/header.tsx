'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink, WHATSAPP_MESSAGE_TRIAL } from "@/lib/constants";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/book-trial", label: "Timetable" },
    { href: "/programs", label: "Programs" },
    { href: "/workshops", label: "Workshops" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
];

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="container-narrow mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-display text-xl md:text-2xl font-bold text-foreground">
                            Parkour<span className="text-primary">Warriors</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="whatsapp" size="sm" asChild>
                            <a
                                href={getWhatsAppLink(WHATSAPP_MESSAGE_TRIAL)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                            <Link href="/book-trial">Book Trial</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-border animate-fade-in">
                        <nav className="flex flex-col gap-1 mb-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${pathname === link.href
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex flex-col gap-3 px-4">
                            <Button variant="whatsapp" size="lg" asChild className="w-full">
                                <a
                                    href={getWhatsAppLink(WHATSAPP_MESSAGE_TRIAL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle size={20} />
                                    WhatsApp Us
                                </a>
                            </Button>
                            <Button variant="default" size="lg" asChild className="w-full">
                                <Link href="/book-trial" onClick={() => setIsMobileMenuOpen(false)}>
                                    Book a Trial
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
