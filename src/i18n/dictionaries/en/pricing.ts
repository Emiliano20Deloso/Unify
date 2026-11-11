// Pricing page (/en/tarifas), typed against the Spanish dictionary.
import type { PricingDictionary } from "../es/pricing";

const pricing: PricingDictionary = {
    meta: {
        title: "Pricing and quotes",
        description:
            "Get a quote for a chauffeured Tesla ride in Mexico City. A fixed price before you book, in Mexican pesos with VAT included. See how every fare is calculated.",
    },
    hero: {
        title: "Pricing",
        text: "A fixed price before you book, in Mexican pesos with VAT included.",
    },
    formula: {
        title: "How it's calculated",
        text: "One formula for every ride. The quoted and confirmed price is what you pay; any additional charge is always disclosed to you.",
        stepsLabel: "Calculation steps",
        steps: {
            fare: {
                title: "Level and distance",
                text: "Each level has a base fare, plus a cost per kilometre. If the ride is short, the level's minimum fare applies.",
            },
            time: {
                title: "Time and day",
                text: "Surcharges apply to the fare from the previous step. If your ride falls into two at once, they are combined.",
            },
            passengers: {
                title: "Passengers",
                text: "Each vehicle carries up to {max} passengers. The additional passenger fee, if any, is added at the end.",
            },
        },
        levelTable: {
            caption: "Base fare, cost per kilometre and minimum fare for each level",
            level: "Level",
            base: "Base fare",
            perKm: "Per kilometre",
            minimum: "Minimum fare",
        },
        clock: {
            label: "Time-of-day surcharges across the day",
            peak: "Peak hours",
            night: "Night",
            normal: "Rest of the day",
            noSurcharge: "No surcharge",
            range: "{start} to {end}",
            join: " and ",
            weekdaysLabel: "Surcharge by day of the week",
            weekdays: ["M", "T", "W", "T", "F", "S", "S"],
            weekend: "Saturday and Sunday",
            holiday: "Public holidays",
            holidayNote: "The holiday surcharge replaces the weekend one.",
        },
        percent: "+{n}%",
        multiplier: "×{m}",
        passenger: {
            from: "From passenger no. {n}",
            each: "per passenger",
        },
        luggage: {
            from: "From bag no. {n}",
            each: "per bag",
        },
        example: {
            title: "An example",
            text: "In {level}, on a weekday at regular hours. The full calculation, line by line:",
            to: "to",
            /** {km}: distancia redondeada (aproximada, como en el cotizador sin Google). */
            km: "≈ {km} km",
            base: "Base fare",
            distance: "{km} km × {rate}",
            minimum: "{level} minimum fare: {amount}",
            minimumNotApplied: "Does not apply",
            normalHours: "Regular hours, weekday",
            total: "Total",
            peakTitle: "If you leave at {time}",
            peakText: "Weekday peak hours",
            levelsTitle: "The same route at each level",
            levelsNote: "Weekday, regular hours.",
        },
    },
    includes: {
        title: "What your fare includes",
        text: "What you pay for and what you don't, according to our terms and conditions.",
        vat: {
            title: "VAT included",
            text: "All fares are in Mexican pesos and include VAT. If you need an invoice (CFDI), you request it after the ride.",
        },
        waiting: {
            title: "Free waiting time",
            city: "{city} min in the city",
            airport: "{airport} min at the airport",
            text: "At the airport, counted from the flight's actual landing. Extra time is charged at {amount} per {block}-minute block or fraction.",
        },
        capacity: {
            title: "Up to {passengers} passengers and {luggage} bags",
            text: "Per vehicle, with standard-size bags. For groups or extra luggage we send you a custom quote.",
        },
        payment: {
            title: "Payment in advance",
            text: "When you confirm the booking, by credit or debit card, bank transfer or other accepted methods.",
        },
        tolls: {
            title: "Tolls and parking",
            text: "Not included unless your quote says so. If they come up, you are always told.",
        },
        cancellation: {
            title: "Cancellations",
            text: "Cancel by email or WhatsApp; the time we receive your notice is what counts. Refunds go back to the same payment method.",
            listLabel: "Refund by how far in advance you cancel",
            rows: [
                { notice: "24 hours or more ahead", refund: "100%" },
                { notice: "Between 24 and 6 hours ahead", refund: "50%" },
                { notice: "Less than 6 hours, or no-show", refund: "No refund" },
            ],
            terms: "Read the full terms",
        },
    },
    custom: {
        title: "What can't be quoted online",
        text: "Hourly service, events, trips outside the city or large groups: message us and we'll send you a tailored quote.",
        cta: "Get a quote on WhatsApp",
        note: "Support Monday to Saturday, 8:00 a.m. to 10:00 p.m.",
        imageAlt: "Grey Tesla Model 3 on an expressway at dusk, next to an overpass",
        listLabel: "Services with a custom quote",
        items: {
            hourly: { title: "By the hour", text: "A driver at your disposal for the time you book." },
            event: { title: "Events and companies", text: "Transportation for your event or your team." },
            out_of_zone: {
                title: "Outside Mexico City",
                text: "Quoted separately and subject to availability.",
            },
            capacity: {
                title: "Groups or extra luggage",
                text: "More than {passengers} passengers or {luggage} bags.",
            },
        },
        external: "(opens WhatsApp)",
    },
};

export default pricing;
