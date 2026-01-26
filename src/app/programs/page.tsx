import { MessageCircle, ChevronRight, Users, User, School, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink, WHATSAPP_MESSAGE_TRIAL } from "@/lib/constants";
import Link from "next/link";

const Programs = () => {
    return (
        <>
            {/* Hero */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Our Programs
                    </h1>
                    <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
                        From weekly classes to intensive workshops, find the perfect training format for your child's goals.
                    </p>
                </div>
            </section>

            {/* Regular Classes */}
            <section className="section-padding bg-background" id="regular">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="text-primary" size={24} />
                                </div>
                                <h2 className="font-display text-3xl font-bold">Regular Classes</h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Our core program for kids and teens. Weekly group sessions with structured curriculum, level-based progression, and a supportive team environment.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "Beginner-friendly — no experience needed",
                                    "Separate groups for kids and teens",
                                    "Parkour and Tricking tracks available",
                                    "Progress through Levels 1–5",
                                    "Weekly feedback and skill tracking",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="default" asChild>
                                <Link href="/contact">Book a Trial</Link>
                            </Button>
                        </div>
                        <div className="bg-muted rounded-2xl p-8">
                            <h3 className="font-display text-xl font-bold mb-4">Class Schedule</h3>
                            <p className="text-muted-foreground mb-4">
                                Classes run on weekday evenings and weekends. Contact us to find the best slot for your child.
                            </p>
                            <div className="space-y-3">
                                <div className="bg-card p-4 rounded-xl">
                                    <p className="font-semibold">Kids (Ages 6–11)</p>
                                    <p className="text-sm text-muted-foreground">Multiple sessions weekly</p>
                                </div>
                                <div className="bg-card p-4 rounded-xl">
                                    <p className="font-semibold">Teens (Ages 12–17)</p>
                                    <p className="text-sm text-muted-foreground">Multiple sessions weekly</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Private Classes */}
            <section className="section-padding bg-muted" id="private">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 bg-card rounded-2xl p-8 card-elevated">
                            <h3 className="font-display text-xl font-bold mb-4">Flexible Options</h3>
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4">
                                    <p className="font-semibold">1-on-1 Sessions</p>
                                    <p className="text-sm text-muted-foreground">Maximum personalized attention</p>
                                </div>
                                <div className="border-l-4 border-primary pl-4">
                                    <p className="font-semibold">Small Groups (2–4 students)</p>
                                    <p className="text-sm text-muted-foreground">Train with friends or siblings</p>
                                </div>
                                <div className="border-l-4 border-primary pl-4">
                                    <p className="font-semibold">Flexible Scheduling</p>
                                    <p className="text-sm text-muted-foreground">Book sessions that work for you</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="text-primary" size={24} />
                                </div>
                                <h2 className="font-display text-3xl font-bold">Private Coaching</h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Accelerate progress with personalized 1-on-1 or small group sessions. Perfect for students who want extra attention, specific skill focus, or flexible scheduling.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "Customized training plan",
                                    "1–4 students per session",
                                    "Work on specific skills or fears",
                                    "Ideal for competition prep",
                                    "Available for all ages and levels",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="default" asChild>
                                <a href={getWhatsAppLink("Hi Parkour Warriors! I'm interested in private coaching sessions.")} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle size={18} />
                                    Enquire on WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* School ECAs */}
            <section className="section-padding bg-background" id="schools">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <School className="text-primary" size={24} />
                                </div>
                                <h2 className="font-display text-3xl font-bold">School ECAs</h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                We partner with schools across Kuala Lumpur to offer after-school parkour and tricking programs. Organized, structured, and safe activities that students love.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "On-site programs at your school",
                                    "Trained coaches with child safety certification",
                                    "Age-appropriate curriculum",
                                    "Regular progress reports for schools",
                                    "Equipment provided",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="default" asChild>
                                <a href={getWhatsAppLink("Hi Parkour Warriors! I'm a school administrator interested in ECA programs.")} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle size={18} />
                                    Contact for Schools
                                </a>
                            </Button>
                        </div>
                        <div className="bg-muted rounded-2xl p-8">
                            <h3 className="font-display text-xl font-bold mb-4">For Schools</h3>
                            <p className="text-muted-foreground mb-4">
                                Bring an exciting, structured physical activity to your students. Our school programs:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Build confidence and physical literacy</li>
                                <li>• Promote discipline and teamwork</li>
                                <li>• Provide clear structure and safety protocols</li>
                                <li>• Include all necessary equipment</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workshops / Holiday Camps */}
            <section className="section-padding bg-muted" id="workshops">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 bg-card rounded-2xl p-8 card-elevated">
                            <h3 className="font-display text-xl font-bold mb-4">Workshop Schedule</h3>
                            <p className="text-sm text-muted-foreground mb-4">3 consecutive days per workshop</p>
                            <div className="space-y-3">
                                <div className="bg-muted p-4 rounded-xl">
                                    <p className="font-semibold">Morning Session</p>
                                    <p className="text-sm text-muted-foreground">9:00 AM – 11:30 AM</p>
                                </div>
                                <div className="bg-muted p-4 rounded-xl">
                                    <p className="font-semibold">Afternoon Session</p>
                                    <p className="text-sm text-muted-foreground">12:00 PM – 2:30 PM</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button variant="default" asChild className="w-full">
                                    <Link href="/workshops">
                                        View Workshop Details
                                        <ChevronRight size={18} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar className="text-primary" size={24} />
                                </div>
                                <h2 className="font-display text-3xl font-bold">Workshops & Camps</h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Intensive multi-day training during school holidays. Perfect for beginners wanting to try parkour or tricking, or students looking to accelerate their skills.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "3-day intensive format",
                                    "Morning and afternoon sessions available",
                                    "All equipment provided",
                                    "Great for beginners and intermediate students",
                                    "Special discount on regular classes after workshop",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Join */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            How to Join
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Getting started is easy. Three simple steps to begin your journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "1",
                                title: "Contact Us",
                                desc: "WhatsApp us or fill out our contact form. Tell us about your child and their interests.",
                            },
                            {
                                step: "2",
                                title: "Trial / Assessment",
                                desc: "Book a trial class. Our coaches will assess your child's level and recommend the right group.",
                            },
                            {
                                step: "3",
                                title: "Choose Program",
                                desc: "Pick the program that fits your schedule and goals. Start training!",
                            },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                                    <span className="font-display text-2xl font-bold">{item.step}</span>
                                </div>
                                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button variant="cta" size="lg" asChild>
                            <a href={getWhatsAppLink(WHATSAPP_MESSAGE_TRIAL)} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={20} />
                                Start on WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Programs;
