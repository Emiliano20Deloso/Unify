// Home page. Typed against the Spanish dictionary.
import type { HomeDictionary } from "../es/home";

const home: HomeDictionary = {
    meta: {
        title: "Unify · Private Tesla chauffeur in Mexico City",
        description:
            "Travel in silence and arrive on time. Private Tesla chauffeur in Mexico City and the metropolitan area, with clear fares in pesos and VAT included.",
    },
    hero: {
        eyebrow: "Private Tesla chauffeur · Mexico City",
        title: ["Travel in silence.", "Arrive on time."],
        text: "Your private chauffeur in a Tesla, on time and with a fixed fare from the moment you get a quote. Mexico City and the metropolitan area.",
        trust: ["Fixed price", "VAT included", "100\u202F% Tesla fleet"],
        imageAlt: "Grey Tesla Model 3 on a desert road at dusk",
    },
    experience: {
        title: "The experience on board",
        text: "A Tesla cleaned and checked before every ride, and a driver who takes care of every detail of the trip.",
        items: [
            {
                title: "Silence and comfort",
                text: "With no combustion engine, the cabin is a quiet space to talk, take a call or rest.",
            },
            {
                title: "Professional drivers",
                text: "Selected and trained by Unify, with background checks. Discreet, punctual and attentive.",
            },
            {
                title: "Punctuality",
                text: "We arrive before the agreed time, so your schedule doesn't depend on traffic.",
            },
            {
                title: "Clear fares",
                text: "You get a quote online and know what you'll pay from the start, in pesos with VAT included.",
            },
            {
                title: "Privacy",
                text: "What happens in the car stays in the car.",
            },
        ],
        images: {
            main: "White front seats of a Tesla in a dark cabin",
            detail: "Glass roof of a Tesla with palm trees and sky overhead",
        },
    },
};

export default home;
