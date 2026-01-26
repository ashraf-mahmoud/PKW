import { MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink, WHATSAPP_MESSAGE_GENERAL } from "@/lib/constants";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "What age can my child start?",
        answer: "We accept children from around 6 years old, depending on their physical readiness and ability to follow instructions. Our coaches will assess each child during a trial class to ensure they're placed in the right group. Teens and adults are also welcome!"
    },
    {
        question: "Is parkour and tricking safe for kids?",
        answer: "Absolutely! Safety is our top priority. We use proper progression systems, quality safety equipment, professional spotting techniques, and trained coaches. Every skill is taught step-by-step, and students only advance when they've mastered the fundamentals. Our controlled gym environment is much safer than learning these skills unsupervised outdoors."
    },
    {
        question: "What's the difference between parkour and tricking?",
        answer: "Parkour focuses on efficient movement through obstacles—vaults, precision jumps, wall runs, rolls, and balance. It's about getting from point A to B in the most effective way. Tricking combines flips, kicks, and acrobatic movements with style and flow—it's more performative and expressive. Many students enjoy both! During your trial, we can help recommend which might suit your child better."
    },
    {
        question: "Do you split students by skill level?",
        answer: "Yes! We have a structured level system (Levels 1–5) based on skill mastery, safety awareness, and consistency. Students are grouped appropriately so beginners learn foundations while more advanced students are challenged. This ensures everyone progresses at the right pace."
    },
    {
        question: "What should my child wear and bring?",
        answer: "Students should wear comfortable athletic clothing that allows full range of movement (t-shirt, shorts or trackpants). Bring clean indoor shoes with flat soles (not running shoes with thick heels), a water bottle, and a small towel. We provide all training equipment."
    },
    {
        question: "Can parents watch the classes?",
        answer: "Yes! We have a comfortable waiting area for parents at our facilities (where available). You're welcome to watch your child's progress. We also provide regular updates on skill development and level advancement."
    },
    {
        question: "How fast do students level up?",
        answer: "Progress varies by individual—it depends on attendance consistency, natural ability, effort, and practice. Most students who attend regularly see noticeable improvement within a few months. Our coaches provide clear feedback on what skills need work for the next level."
    },
    {
        question: "Do you offer private classes?",
        answer: "Yes! We offer private 1-on-1 sessions and small group sessions (2–4 students). These are great for students who want personalized attention, need to work on specific skills, or prefer flexible scheduling. Contact us for private coaching availability."
    },
    {
        question: "Do you run programs at schools?",
        answer: "Yes! We partner with schools across Kuala Lumpur to offer after-school ECA (extracurricular activity) programs. If you're a school administrator interested in bringing parkour or tricking to your students, please contact us to discuss options."
    },
    {
        question: "How do I book a class or trial?",
        answer: "The easiest way is to WhatsApp us directly! Just tap the WhatsApp button on this page and we'll help you schedule a trial class, answer any questions, and find the best program for your child. You can also fill out our contact form."
    },
    {
        question: "What if my child doesn't enjoy the trial?",
        answer: "That's completely okay! The trial class is designed to help both you and your child experience our training style with no pressure. If it's not the right fit, there's no obligation to continue. Most kids love it once they try it!"
    },
    {
        question: "Are there any discounts available?",
        answer: "Yes! We offer sibling discounts for families with multiple children enrolled. Workshop participants also receive 35% off their first month of regular classes if they join within 30 days. Contact us for current promotions."
    }
];

const FAQ = () => {
    return (
        <>
            {/* Hero */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
                        Everything parents want to know about Parkour Warriors.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto max-w-3xl">
                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem
                                key={i}
                                value={`item-${i}`}
                                className="bg-card rounded-xl px-6 border-none card-elevated"
                            >
                                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Still Have Questions */}
            <section className="section-padding bg-muted">
                <div className="container-narrow mx-auto text-center">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                        Still Have Questions?
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        We're here to help! Reach out via WhatsApp for quick answers or use our contact form.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="whatsapp" size="lg" asChild>
                            <a href={getWhatsAppLink(WHATSAPP_MESSAGE_GENERAL)} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={20} />
                                WhatsApp Us
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/contact">
                                Contact Form
                                <ChevronRight size={18} />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FAQ;
