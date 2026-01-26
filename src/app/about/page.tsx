import { Shield, TrendingUp, Users, Heart, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const About = () => {
    return (
        <>
            {/* Hero */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        About Us
                    </h1>
                    <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
                        Building confident, capable movers in Kuala Lumpur since day one.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                                Our Mission
                            </h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                We believe every child deserves to discover what their body is capable of. Parkour Warriors exists to build confident, capable movers who carry the skills they learn far beyond the gym.
                            </p>
                            <p className="text-muted-foreground mb-6">
                                Through parkour and tricking, we teach more than just physical techniques. We instill discipline, resilience, and the courage to face challenges—skills that translate to every area of life.
                            </p>
                            <p className="text-foreground font-semibold">
                                Our goal: Help young people move with confidence, train with purpose, and grow with every session.
                            </p>
                        </div>
                        <div className="bg-muted rounded-2xl p-8">
                            <h3 className="font-display text-xl font-bold mb-6 text-center">What Drives Us</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Target, text: "Empowering youth through movement" },
                                    { icon: Shield, text: "Making training safe and accessible" },
                                    { icon: TrendingUp, text: "Fostering continuous improvement" },
                                    { icon: Heart, text: "Building a supportive community" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-card p-4 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <item.icon className="text-primary" size={20} />
                                        </div>
                                        <span className="text-foreground font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coaching Philosophy */}
            <section className="section-padding bg-muted">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Coaching Philosophy
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our approach balances challenge with safety, pushing students to grow while ensuring they're always protected.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Safety",
                                desc: "Proper progressions, spotting, and controlled environments. We never skip steps.",
                            },
                            {
                                icon: TrendingUp,
                                title: "Progression",
                                desc: "Structured levels ensure students build skills on solid foundations.",
                            },
                            {
                                icon: Award,
                                title: "Discipline",
                                desc: "We teach focus, respect, and the value of consistent practice.",
                            },
                            {
                                icon: Heart,
                                title: "Fun",
                                desc: "Training should be enjoyable. We keep sessions engaging and rewarding.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="bg-card p-6 rounded-xl card-elevated text-center">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="text-primary" size={24} />
                                </div>
                                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Our Values
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                title: "Safety",
                                desc: "Every technique is taught with proper progression. We use quality equipment, maintain clean facilities, and ensure every student trains in a controlled environment.",
                            },
                            {
                                title: "Respect",
                                desc: "We expect students to respect their coaches, peers, and the training space. This mutual respect creates a positive environment where everyone can thrive.",
                            },
                            {
                                title: "Progress",
                                desc: "We celebrate improvement at every level. Our structured system ensures students always have clear goals to work toward and can see their advancement.",
                            },
                            {
                                title: "Community",
                                desc: "Parkour Warriors is more than a gym—it's a community of like-minded families who support each other's growth and celebrate each other's wins.",
                            },
                        ].map((value, i) => (
                            <div key={i} className="bg-card p-8 rounded-2xl card-elevated">
                                <h3 className="font-display text-2xl font-bold text-primary mb-4">{value.title}</h3>
                                <p className="text-muted-foreground">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety Standards */}
            <section className="section-padding bg-muted">
                <div className="container-narrow mx-auto">
                    <div className="bg-card rounded-2xl p-8 md:p-12 card-elevated">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Shield className="text-primary" size={24} />
                                    </div>
                                    <h2 className="font-display text-2xl md:text-3xl font-bold">Safety Standards</h2>
                                </div>
                                <p className="text-muted-foreground mb-6">
                                    Your child's safety is our top priority. We maintain rigorous safety standards across all our programs and facilities.
                                </p>
                            </div>
                            <div>
                                <ul className="space-y-3">
                                    {[
                                        "Thorough warm-ups before every session",
                                        "Progressive skill development (no skipping levels)",
                                        "Professional spotting techniques",
                                        "Safe landing technique training",
                                        "Quality safety mats and equipment",
                                        "Controlled training environments",
                                        "Trained and certified coaches",
                                        "First aid ready on-site",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span className="text-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
                        Join the Warriors
                    </h2>
                    <p className="text-secondary-foreground/70 mb-8 max-w-xl mx-auto">
                        Ready to see what your child is capable of? Book a trial class today.
                    </p>
                    <Button variant="cta" size="lg" asChild>
                        <Link href="/contact">
                            Book a Trial
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
};

export default About;
