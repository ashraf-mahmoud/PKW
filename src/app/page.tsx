import Link from "next/link";
import { MessageCircle, Shield, Users, TrendingUp, Award, ChevronRight, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink, WHATSAPP_MESSAGE_TRIAL } from "@/lib/constants";
import heroImage from "@/assets/hero-parkour.jpg";
import parkourAction from "@/assets/parkour-action.jpg";
import trickingAction from "@/assets/tricking-action.jpg";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage.src}
            alt="Parkour athlete performing a vault"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-transparent" />
        </div>

        <div className="container-narrow mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
              Build <span className="text-gradient-orange">Confidence.</span>
              <br />
              Strength. Control.
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8 leading-relaxed">
              Parkour & Tricking classes in Kuala Lumpur for kids and teens—structured progress, safe coaching, real skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link href="/login">
                  Book a Trial
                  <ChevronRight size={20} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a
                  href={getWhatsAppLink(WHATSAPP_MESSAGE_TRIAL)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={20} />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Teach */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We Teach
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Two disciplines, one academy. Choose your path or combine both for complete movement mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Parkour Card */}
            <div className="bg-card rounded-2xl overflow-hidden card-elevated group">
              <div className="aspect-video overflow-hidden">
                <img
                  src={parkourAction.src}
                  alt="Parkour training"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-primary" size={24} />
                  <h3 className="font-display text-2xl font-bold">Parkour</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Movement through obstacles: vaults, precision jumps, wall runs, rolls, and balance. Learn to navigate any environment with efficiency and control.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/programs">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Tricking Card */}
            <div className="bg-card rounded-2xl overflow-hidden card-elevated group">
              <div className="aspect-video overflow-hidden">
                <img
                  src={trickingAction.src}
                  alt="Tricking training"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-primary" size={24} />
                  <h3 className="font-display text-2xl font-bold">Tricking</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Flips + kicks + style: dynamic skills built with progression and control. Express yourself through powerful, acrobatic movements.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/programs">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-8 italic">
            Not sure which one fits? We'll recommend the best start after a trial.
          </p>
        </div>
      </section>

      {/* Levels / Progress System */}
      <section className="section-padding bg-muted">
        <div className="container-narrow mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Structured Progress System
              </h2>
              <p className="text-muted-foreground mb-6">
                Students progress through Levels 1–5 based on skill mastery, safety awareness, and consistency. Each level introduces new challenges while reinforcing fundamentals.
              </p>
              <div className="space-y-4">
                {[
                  { level: "Level 1", desc: "Foundations & Safety Basics" },
                  { level: "Level 2", desc: "Core Techniques & Control" },
                  { level: "Level 3", desc: "Intermediate Skills & Flow" },
                  { level: "Level 4", desc: "Advanced Movements" },
                  { level: "Level 5", desc: "Mastery & Style" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-card p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-display font-bold text-primary">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.level}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-8 rounded-2xl card-elevated">
              <h3 className="font-display text-xl font-bold mb-4">How Students Level Up</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Award className="text-primary mt-1 shrink-0" size={20} />
                  <span>Demonstrate skill proficiency in assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="text-primary mt-1 shrink-0" size={20} />
                  <span>Show consistent safety awareness</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="text-primary mt-1 shrink-0" size={20} />
                  <span>Display respect for coaches and peers</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="text-primary mt-1 shrink-0" size={20} />
                  <span>Maintain regular attendance and effort</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Parents Trust Us */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Parents Trust Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Safety-First Coaching",
                desc: "Warm-ups, progressions, spotting, and controlled environments.",
              },
              {
                icon: Users,
                title: "Age-Appropriate Groups",
                desc: "Classes designed for different developmental stages.",
              },
              {
                icon: TrendingUp,
                title: "Structured Progression",
                desc: "Clear level system with measurable milestones.",
              },
              {
                icon: Award,
                title: "Respectful Environment",
                desc: "Discipline and sportsmanship are core values.",
              },
              {
                icon: MessageCircle,
                title: "Clear Communication",
                desc: "Regular updates on your child's progress.",
              },
              {
                icon: Target,
                title: "Parent Waiting Area",
                desc: "Comfortable space for parents (where available).",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-xl card-elevated text-center"
              >
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

      {/* Programs Snapshot */}
      <section className="section-padding bg-muted">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Programs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From regular classes to private coaching, we have options for every schedule and goal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Regular Classes",
                desc: "Weekly group sessions for kids & teens at all skill levels.",
                link: "/programs",
              },
              {
                title: "Private Coaching",
                desc: "1-on-1 or small group sessions for accelerated learning.",
                link: "/programs",
              },
              {
                title: "School ECAs",
                desc: "After-school programs organized at partner schools.",
                link: "/programs",
              },
              {
                title: "Holiday Workshops",
                desc: "Intensive multi-day camps during school breaks.",
                link: "/workshops",
              },
            ].map((program, i) => (
              <Link
                key={i}
                href={program.link}
                className="bg-card p-6 rounded-xl card-elevated group"
              >
                <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {program.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{program.desc}</p>
                <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ChevronRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Parents Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "My son was shy and uncoordinated. After 6 months at Parkour Warriors, he's confident, strong, and can't wait for his next class!",
                author: "Sarah M.",
                child: "Mother of 9-year-old",
              },
              {
                quote: "The coaches are amazing. They make safety a priority while still making every session exciting and challenging.",
                author: "David L.",
                child: "Father of 12-year-old",
              },
              {
                quote: "The level system gives my daughter real goals to work toward. She's so proud when she moves up!",
                author: "Michelle T.",
                child: "Mother of 10-year-old",
              },
              {
                quote: "Finally found an activity my teenager actually wants to attend. The tricking classes are his highlight of the week.",
                author: "James K.",
                child: "Father of 14-year-old",
              },
              {
                quote: "Professional, organized, and my kids love it. The holiday workshops are especially great!",
                author: "Lisa W.",
                child: "Mother of 8 & 11-year-olds",
              },
              {
                quote: "Worth every ringgit. The improvement in my son's fitness, confidence, and discipline is remarkable.",
                author: "Ahmad R.",
                child: "Father of 11-year-old",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-xl card-elevated"
              >
                <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.child}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Ready to Start?
          </h2>
          <p className="text-secondary-foreground/70 mb-8 max-w-xl mx-auto">
            Book a trial class today and discover what your child is capable of.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="lg" asChild>
              <Link href="/login">
                Book a Trial
                <ChevronRight size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a
                href={getWhatsAppLink(WHATSAPP_MESSAGE_TRIAL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={20} />
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
