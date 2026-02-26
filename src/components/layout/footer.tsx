import Link from "next/link";
import { Instagram, Facebook, MessageCircle, MapPin } from "lucide-react";
import { SOCIAL_LINKS, LOCATION, getWhatsAppLink, WHATSAPP_MESSAGE_GENERAL } from "@/lib/constants";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { href: "/programs", label: "Programs" },
        { href: "/workshops", label: "Workshops" },
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About Us" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <footer className="bg-secondary text-secondary-foreground">
            <div className="container-narrow mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <span className="font-display text-2xl font-bold">
                                Parkour <span className="text-primary">Warriors</span>
                            </span>
                        </Link>
                        <p className="text-secondary-foreground/70 mb-4 max-w-md">
                            Building confident, capable movers through structured parkour and tricking training in Kuala Lumpur.
                        </p>
                        <div className="flex items-center gap-2 text-secondary-foreground/70">
                            <MapPin size={18} />
                            <span>{LOCATION}</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
                        <nav className="flex flex-col gap-2">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-secondary-foreground/70 hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="font-display text-lg font-semibold mb-4">Connect</h4>
                        <div className="flex flex-col gap-3">
                            <a
                                href={getWhatsAppLink(WHATSAPP_MESSAGE_GENERAL)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors"
                            >
                                <MessageCircle size={20} />
                                WhatsApp
                            </a>
                            <a
                                href={SOCIAL_LINKS.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors"
                            >
                                <Instagram size={20} />
                                Instagram
                            </a>
                            <a
                                href={SOCIAL_LINKS.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors"
                            >
                                <Facebook size={20} />
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-secondary-foreground/10 mt-10 pt-8 text-center text-secondary-foreground/50 text-sm">
                    <p>© {currentYear} Parkour Warriors. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
