'use client'

import { useState } from "react";
import { MessageCircle, Clock, MapPin, Instagram, Facebook, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getWhatsAppLink, WHATSAPP_MESSAGE_TRIAL, BUSINESS_HOURS, LOCATION, SOCIAL_LINKS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        parentName: "",
        childAge: "",
        location: "",
        interest: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
            title: "Message Sent!",
            description: "We'll get back to you within 24 hours.",
        });

        setFormData({
            parentName: "",
            childAge: "",
            location: "",
            interest: "",
            message: "",
        });
        setIsSubmitting(false);
    };

    return (
        <>
            {/* Hero */}
            <section className="section-padding bg-secondary">
                <div className="container-narrow mx-auto text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Contact Us
                    </h1>
                    <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
                        Ready to start? Book a trial class or ask us anything.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section-padding bg-background">
                <div className="container-narrow mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* WhatsApp CTA & Info */}
                        <div>
                            <div className="bg-[#25D366]/10 rounded-2xl p-8 mb-8">
                                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                                    Fastest Way to Reach Us
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    WhatsApp is the quickest way to get answers and book a trial. We typically respond within a few hours.
                                </p>
                                <Button variant="whatsapp" size="lg" asChild className="w-full sm:w-auto">
                                    <a href={getWhatsAppLink(WHATSAPP_MESSAGE_TRIAL)} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle size={20} />
                                        WhatsApp Us Now
                                    </a>
                                </Button>
                            </div>

                            {/* Business Hours */}
                            <div className="bg-card rounded-2xl p-8 card-elevated mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Clock className="text-primary" size={20} />
                                    </div>
                                    <h3 className="font-display text-xl font-bold">Business Hours</h3>
                                </div>
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Monday – Friday</span>
                                        <span className="font-medium text-foreground">{BUSINESS_HOURS.weekdays}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="font-medium text-foreground">{BUSINESS_HOURS.saturday}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="font-medium text-foreground">{BUSINESS_HOURS.sunday}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-card rounded-2xl p-8 card-elevated mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MapPin className="text-primary" size={20} />
                                    </div>
                                    <h3 className="font-display text-xl font-bold">Location</h3>
                                </div>
                                <p className="text-muted-foreground">{LOCATION}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Contact us for specific training venue addresses.
                                </p>
                            </div>

                            {/* Social Links */}
                            <div className="bg-card rounded-2xl p-8 card-elevated">
                                <h3 className="font-display text-xl font-bold mb-4">Follow Us</h3>
                                <div className="flex gap-4">
                                    <a
                                        href={SOCIAL_LINKS.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <Instagram size={24} />
                                    </a>
                                    <a
                                        href={SOCIAL_LINKS.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <Facebook size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card rounded-2xl p-8 card-elevated h-fit">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                                Send Us a Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                                    <Input
                                        id="parentName"
                                        value={formData.parentName}
                                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                        required
                                        className="mt-2"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="childAge">Child's Age *</Label>
                                    <Input
                                        id="childAge"
                                        value={formData.childAge}
                                        onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                                        required
                                        className="mt-2"
                                        placeholder="e.g., 10 years old"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="location">Preferred Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="mt-2"
                                        placeholder="Area in Kuala Lumpur"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="interest">I'm Interested In *</Label>
                                    <Select
                                        value={formData.interest}
                                        onValueChange={(value) => setFormData({ ...formData, interest: value })}
                                        required
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="trial">Trial Class</SelectItem>
                                            <SelectItem value="workshop">Holiday Workshop</SelectItem>
                                            <SelectItem value="private">Private Coaching</SelectItem>
                                            <SelectItem value="school">School ECA Program</SelectItem>
                                            <SelectItem value="other">General Enquiry</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="mt-2"
                                        rows={4}
                                        placeholder="Any questions or additional information..."
                                    />
                                </div>

                                <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        "Sending..."
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contact;
