import { MessageCircle, ChevronRight, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink, WHATSAPP_MESSAGE_GENERAL } from "@/lib/constants";
import Link from "next/link";

const Pricing = () => {
    return (
        <>
            {/* Hero */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Pricing
                    </h1>
                    <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
                        Flexible options to fit your budget and training goals.
                    </p>
                </div>
            </section>

            {/* Pricing Overview */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Our Packages
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            We offer various packages to suit different needs. Contact us for current pricing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {/* Trial Class */}
                        <div className="bg-card rounded-2xl p-8 card-elevated">
                            <h3 className="font-display text-xl font-bold mb-2">Trial Class</h3>
                            <p className="text-muted-foreground mb-6">
                                Perfect first step to experience our training style and meet the coaches.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Single session experience</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Level assessment included</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Program recommendation</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/contact">Book Trial</Link>
                            </Button>
                        </div>

                        {/* Monthly Membership */}
                        <div className="bg-card rounded-2xl p-8 card-elevated border-2 border-primary relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                            </div>
                            <h3 className="font-display text-xl font-bold mb-2">Monthly Membership</h3>
                            <p className="text-muted-foreground mb-6">
                                Regular weekly classes with consistent progress and community.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Weekly group classes</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Level progression tracking</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Parkour or Tricking track</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Flexible session options</span>
                                </li>
                            </ul>
                            <Button variant="default" className="w-full" asChild>
                                <a href={getWhatsAppLink(WHATSAPP_MESSAGE_GENERAL)} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle size={18} />
                                    Get Pricing
                                </a>
                            </Button>
                        </div>

                        {/* Private Packages */}
                        <div className="bg-card rounded-2xl p-8 card-elevated">
                            <h3 className="font-display text-xl font-bold mb-2">Private Packages</h3>
                            <p className="text-muted-foreground mb-6">
                                Personalized 1-on-1 or small group coaching for faster progress.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">4 sessions/month option</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">8 sessions/month option</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Customized training plan</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm text-foreground">Flexible scheduling</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full" asChild>
                                <a href={getWhatsAppLink("Hi Parkour Warriors! I'm interested in private coaching packages.")} target="_blank" rel="noopener noreferrer">
                                    Enquire Now
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Request Price List CTA */}
                    <div className="bg-muted rounded-2xl p-8 md:p-12 text-center">
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Request Current Price List
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                            Pricing may vary by location and program. WhatsApp us for the most up-to-date pricing and available promotions.
                        </p>
                        <Button variant="cta" size="lg" asChild>
                            <a href={getWhatsAppLink("Hi Parkour Warriors! I'd like to request the current price list.")} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={20} />
                                WhatsApp for Prices
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="section-padding bg-muted">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            What's Included
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Professional Coaching", desc: "Trained, certified instructors" },
                            { title: "Safe Environment", desc: "Proper equipment and safety mats" },
                            { title: "Progress Tracking", desc: "Level-based advancement system" },
                            { title: "Small Class Sizes", desc: "Personal attention for each student" },
                        ].map((item, i) => (
                            <div key={i} className="bg-card p-6 rounded-xl text-center card-elevated">
                                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Preview */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="bg-card rounded-2xl p-8 card-elevated">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <HelpCircle className="text-primary" size={24} />
                            </div>
                            <div>
                                <h3 className="font-display text-xl font-bold mb-2">Have Questions?</h3>
                                <p className="text-muted-foreground mb-4">
                                    Check our FAQ for answers about classes, scheduling, safety, and more.
                                </p>
                                <Button variant="outline" asChild>
                                    <Link href="/faq">
                                        View FAQ
                                        <ChevronRight size={18} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="pb-16 px-4">
                <div className="container-narrow mx-auto">
                    <p className="text-sm text-muted-foreground text-center">
                        * Prices may vary by location and program. Contact us for exact pricing. Promotional offers may have terms and conditions.
                    </p>
                </div>
            </section>
        </>
    );
};

export default Pricing;
