// Services page (/en/servicios), typed against the Spanish dictionary.
import type { ServicesDictionary } from "../es/services";

const services: ServicesDictionary = {
    meta: {
        title: "Services",
        description:
            "Private luxury chauffeur service in a Tesla: point-to-point rides, airport transfers, hourly service, events and companies in Mexico City.",
    },
    hero: {
        title: "Services",
        text: "Private chauffeured rides in a Tesla, across Mexico City and its metropolitan area. You choose the ride; we take care of the rest.",
        imageAlt: "Three Teslas, white, red and blue, on an avenue between glass buildings at sunset",
    },
    types: {
        title: "Five ways to ride with Unify",
        text: "City rides are quoted instantly. Everything else we plan with you on WhatsApp.",
        online: "Quote online",
        custom: "Custom quote",
        featuresLabel: "Service details",
        quoteCta: "Get a quote",
        whatsappCta: "Get a quote on WhatsApp",
        external: "(opens WhatsApp)",
        items: {
            point: {
                title: "Point-to-point rides",
                text: "From the door you choose to your destination, within Mexico City and its metropolitan area. You see the price before you book.",
                features: [
                    "{city} minutes of free grace time",
                    "Up to {passengers} passengers and {luggage} bags",
                    "One way or round trip",
                ],
                imageAlt: "Red Tesla in profile in a dark space, in front of red light panels",
            },
            airport: {
                title: "Airport",
                text: "To or from the airport. We don't track flights: if the airline is delayed, extra waiting time may be charged.",
                features: [
                    "{airport} minutes of free waiting from landing",
                    "Give us your flight number when you book",
                    "Arrival, departure or both",
                ],
                imageAlt: "Looking up through a Tesla's glass roof at palm trees and a clear sky",
            },
            hourly: {
                title: "Hourly service",
                text: "Your driver stays at your disposal for the time you book. If you need more, the extension is charged separately and always disclosed.",
            },
            event: {
                title: "Events and companies",
                text: "Rides for your event or your team, quoted by dates, times and number of vehicles.",
            },
            out_of_zone: {
                title: "Outside Mexico City",
                text: "Trips beyond the metropolitan area. Quoted separately and subject to availability.",
            },
        },
        customImageAlt: "Red Tesla on a coastal road by the sea, seen from above",
    },
};

export default services;
