// Editable placeholders - Update these values
export const WHATSAPP_NUMBER = "60123456789"; // Replace with actual WhatsApp number
export const WHATSAPP_MESSAGE_TRIAL = "Hi Parkour Warriors! I'd like to book a trial class. My child is ___ years old.";
export const WHATSAPP_MESSAGE_GENERAL = "Hi Parkour Warriors! I have a question about your programs.";
export const WHATSAPP_MESSAGE_WORKSHOP = "Hi Parkour Warriors! I'd like to reserve a spot for the holiday workshop. My child is ___ years old.";

export const BUSINESS_HOURS = {
    weekdays: "10:00 AM - 8:00 PM",
    saturday: "9:00 AM - 6:00 PM",
    sunday: "9:00 AM - 4:00 PM",
};

export const SOCIAL_LINKS = {
    instagram: "https://instagram.com/parkourwarriorsmy",
    facebook: "https://facebook.com/parkourwarriorsmy",
};

export const LOCATION = "Kuala Lumpur, Malaysia";

export const getWhatsAppLink = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};
