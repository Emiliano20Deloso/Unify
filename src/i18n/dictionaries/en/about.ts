// /about in English. Parte de la versión del sitio anterior, corregida para decir exactamente
// lo mismo que Nosotros.md (tipado contra el español).
import type { AboutDictionary } from "../es/about";

const about: AboutDictionary = {
    meta: {
        title: "About",
        description: "The luxury of the future: silent, clean and intelligent. Meet who we are and why we only operate Teslas.",
    },
    title: "About",
    lead: "The luxury of the future: silent, clean and intelligent.",
    heroAlt: "White Tesla seen from the front, between lit concrete walls",
    story: {
        title: "Who we are",
        paragraphs: [
            "We are two brothers who got tired of the same thing: every time we needed a fast, comfortable ride, we were met with cars in terrible condition and poorly trained drivers. One day we asked ourselves: why should we settle for a service that keeps getting worse and more expensive?",
            "We didn't have to. That's how Unify was born: impeccable cars, professional chauffeurs and a service designed so your time on the road is worth it. We drive travelers, executives and anyone who values their time, with the same attention on an airport transfer as on a special night.",
        ],
    },
    tesla: {
        title: "Why Tesla",
        text: "We chose to operate exclusively with Tesla vehicles because we believe the luxury of the future is silent, clean and intelligent.",
        imageAlt: "Dark grey Tesla seen from behind, parked by the coast at sunset",
        reasons: [
            {
                title: "Silence on board",
                text: "Without a combustion engine, the cabin is a quiet space to talk, take a call or rest.",
            },
            {
                title: "Zero emissions",
                text: "Every electric trip is a way to move around the city without polluting the air we all breathe.",
            },
            {
                title: "Comfort and technology",
                text: "Spacious interiors, personalized climate control and a smooth ride, even in city traffic.",
            },
            {
                title: "Safety",
                text: "Vehicles designed to high safety standards, with driver assistance systems.",
            },
        ],
    },
    care: {
        title: "How we take care of you",
        text: "The vehicle is only one part. What makes Unify different is how we take care of every detail of your trip.",
        imageAlt: "Body structure and battery of a Tesla Model 3 on a black background",
        items: [
            {
                title: "Professional chauffeurs",
                text: "Selected and trained by Unify, with background checks. Discreet, punctual and attentive.",
            },
            {
                title: "Punctuality",
                text: "We arrive before the agreed time, so your schedule doesn't depend on traffic.",
            },
            {
                title: "Impeccable vehicles",
                text: "Clean and checked before every service.",
            },
            {
                title: "Privacy",
                text: "What happens in the vehicle stays in the vehicle.",
            },
            {
                title: "Clear pricing",
                text: "You get a quote and book online, and you know what you'll pay from the start.",
            },
            {
                title: "Direct support",
                text: "A real person monitors every trip, prioritizing your comfort and safety at all times.",
            },
        ],
    },
    environment: {
        title: "Our commitment to the environment",
        imageAlt: "Hand plugging the charging cable into a white Tesla",
        paragraphs: [
            "Moving around the city shouldn't cost the planet. That's why our fleet is 100% electric: none of our vehicles emit polluting gases from the exhaust, in a city where air quality affects us all.",
            "With Unify you don't have to choose between traveling in luxury and taking care of the environment: every trip with us is a cleaner way to get around Mexico City.",
        ],
    },
    cta: {
        title: "Get a quote for your next trip",
        text: "Know what you'll pay from the start, VAT included.",
        action: "Get a quote",
    },
};

export default about;
