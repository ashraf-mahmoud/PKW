import { MessageCircle, ChevronRight, CheckCircle, Gift, Users, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink, WHATSAPP_MESSAGE_WORKSHOP } from "@/lib/constants";
import Link from "next/link";

const Workshops = () => {
    return (
        <>
            {/* Hero */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <div className="inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
                        Limited Spots Available
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Holiday Workshops
                    </h1>
                    <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg mb-8">
                        Intensive 3-day Parkour & Tricking camps during school breaks. Build skills fast in a fun, structured environment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="cta" size="lg" asChild>
                            <a href={getWhatsAppLink(WHATSAPP_MESSAGE_WORKSHOP)} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={20} />
                                Reserve a Spot
                            </a>
                        </Button>
                        <Button variant="heroOutline" size="lg" asChild>
                            <Link href="/contact">
                                Contact Form
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* What They Learn */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                                What Your Child Will Learn
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "Fundamental movement techniques and safety principles",
                                    "Parkour: vaults, precision jumps, rolls, balance skills",
                                    "Tricking: basic flips, kicks, and acrobatic foundations",
                                    "Body awareness, coordination, and spatial control",
                                    "Confidence to try new physical challenges",
                                    "Discipline, respect, and teamwork",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-muted rounded-2xl p-8">
                            <h3 className="font-display text-xl font-bold mb-6 text-center">Workshop Highlights</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Calendar, label: "3 Days", desc: "Intensive training" },
                                    { icon: Clock, label: "2.5 Hours", desc: "Per session" },
                                    { icon: Users, label: "Small Groups", desc: "Personal attention" },
                                    { icon: Gift, label: "All Included", desc: "Equipment provided" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-card p-4 rounded-xl text-center">
                                        <item.icon className="text-primary mx-auto mb-2" size={28} />
                                        <p className="font-semibold text-foreground">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Schedule */}
            <section className="section-padding bg-muted">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Daily Schedule
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Choose morning or afternoon sessions to fit your schedule. Same great program, flexible timing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        <div className="bg-card p-8 rounded-2xl card-elevated">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Clock className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold">Morning Session</h3>
                                    <p className="text-muted-foreground">9:00 AM – 11:30 AM</p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• 9:00 – Arrival & Warm-up</li>
                                <li>• 9:30 – Skill Training Block 1</li>
                                <li>• 10:15 – Water Break</li>
                                <li>• 10:30 – Skill Training Block 2</li>
                                <li>• 11:15 – Cool-down & Review</li>
                            </ul>
                        </div>

                        <div className="bg-card p-8 rounded-2xl card-elevated">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Clock className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold">Afternoon Session</h3>
                                    <p className="text-muted-foreground">12:00 PM – 2:30 PM</p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• 12:00 – Arrival & Warm-up</li>
                                <li>• 12:30 – Skill Training Block 1</li>
                                <li>• 1:15 – Water Break</li>
                                <li>• 1:30 – Skill Training Block 2</li>
                                <li>• 2:15 – Cool-down & Review</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who It's For */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="bg-muted rounded-2xl p-8">
                            <h3 className="font-display text-xl font-bold mb-4">Perfect For</h3>
                            <ul className="space-y-3">
                                {[
                                    "Kids and teens wanting to try parkour or tricking",
                                    "Students looking to accelerate their progress",
                                    "Beginners with no prior experience",
                                    "Intermediate students refining their skills",
                                    "Anyone looking for an active school break activity",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                                Who Is This For?
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Our holiday workshops welcome kids and teens of all experience levels. Whether your child has never tried parkour or is looking to level up their skills during the break, our coaches adapt to each student.
                            </p>
                            <div className="bg-card p-6 rounded-xl border-l-4 border-primary">
                                <p className="font-semibold text-foreground mb-1">No experience required!</p>
                                <p className="text-sm text-muted-foreground">
                                    We start with the basics and progress at each student's pace.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What to Bring */}
            <section className="section-padding bg-muted">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            What to Bring
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { title: "Comfortable Clothes", desc: "Athletic wear that allows movement" },
                            { title: "Indoor Shoes", desc: "Clean, flat-soled trainers" },
                            { title: "Water Bottle", desc: "Stay hydrated throughout" },
                            { title: "Small Towel", desc: "For wiping sweat" },
                        ].map((item, i) => (
                            <div key={i} className="bg-card p-6 rounded-xl text-center card-elevated">
                                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Special Offers */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Gift className="text-primary" size={28} />
                            </div>
                            <div>
                                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                                    Special Workshop Offers
                                </h2>
                                <p className="text-muted-foreground">
                                    Exclusive deals for workshop participants
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-card p-6 rounded-xl">
                                <div className="text-3xl font-display font-bold text-primary mb-2">35% OFF</div>
                                <p className="font-semibold text-foreground mb-1">First Month of Regular Classes</p>
                                <p className="text-sm text-muted-foreground">
                                    Join within 30 days after completing a workshop to receive 35% off your first month of regular classes.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-xl">
                                <div className="text-3xl font-display font-bold text-primary mb-2">Sibling</div>
                                <p className="font-semibold text-foreground mb-1">Discount Available</p>
                                <p className="text-sm text-muted-foreground">
                                    Registering multiple children? Ask us about our sibling discount when you book.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
                        Reserve Your Spot
                    </h2>
                    <p className="text-secondary-foreground/70 mb-8 max-w-xl mx-auto">
                        Spots are limited to maintain quality coaching. Don't miss out on the next workshop!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="cta" size="lg" asChild>
                            <a href={getWhatsAppLink(WHATSAPP_MESSAGE_WORKSHOP)} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={20} />
                                WhatsApp to Reserve
                            </a>
                        </Button>
                        <Button variant="heroOutline" size="lg" asChild>
                            <Link href="/contact">
                                Use Contact Form
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Workshops;
