/**
 * Wedding website content — edit this file to fill in your details.
 * Anything marked with TODO is a placeholder waiting for real info.
 */

export const weddingContent = {
  couple: {
    partnerOne: "Ethan",
    partnerTwo: "Amanda",
    short: "Ethan & Amanda",
  },

  date: {
    display: "Saturday, January 23, 2027",
    short: "January 23, 2027",
    iso: "2027-01-23",
    time: "Ceremony at 1:00 PM",
  },

  venue: {
    ceremony: {
      name: "Cross and Crown Church",
      address: "4554 12th Ave NE",
      city: "Seattle, WA",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=4554+12th+Ave+NE+Seattle+WA+98105",
      notes:
        "Arrive 15 minutes before 1:00. A parking garage is across the street.",
    },
    reception: {
      name: "Rosehill Community Center",
      address: "304 Lincoln Ave",
      city: "Mukilteo, WA",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=304+Lincoln+Ave+Mukilteo+WA+98275",
      notes: "Plenty of parking on site.",
    },
    sameLocation: false,
  },

  hero: {
    eyebrow: "We're getting married,",
    headline: "Ethan & Amanda",
    subhead: "Join us as we celebrate a lifetime together.",
    cta: "RSVP",
    image: "/wedding/wedding-04.png",
  },

  saveTheDate: {
    eyebrow: "Save the date",
    headline: "We're getting married",
    guestInviteLine:
      "We can't wait to celebrate with you. Hold the date — a proper invitation is on its way.",
    subhead:
      "We're so glad you're part of our story. Formal invitations with all the details will follow.",
    guestSubhead:
      "Leave your mailing address and we'll send your invitation when the time comes.",
    image: "/wedding/wedding-04.png",
    addressIntro:
      "One address for your household is perfect.",
    allergiesIntro:
      "Any food allergies or dietary restrictions we should know about for your household?",
    addressThanks: "You're all set — thank you. We'll send your invitation here.",
    cityHint: "Seattle & Mukilteo",
  },

  story: {
    eyebrow: "Our story",
    title: "How we got here",
    paragraphs: [
      "TODO: A short paragraph about how you met — keep it warm and personal.",
      "TODO: A second paragraph about the proposal or what this day means to you.",
    ],
    image: "/wedding/wedding-02.png",
  },

  schedule: {
    eyebrow: "The day",
    title: "Celebration timeline",
    items: [
      {
        time: "1:00 PM",
        title: "Ceremony",
        description: "The ceremony begins promptly at 1:00 and will finish around 2:15.",
      },
      {
        time: "3:00 PM",
        title: "Cocktail hour",
        description: "Head to the reception when the ceremony ends.",
      },
      {
        time: "4:00 PM",
        title: "First Dance",
        description: "Amanda and Ethan will dance",
      },
      {
        time: "4:15 PM",
        title: "Dinner & Toasts",
        description: "A buffet starting at 4:15, scroll down to see the menu.",
      },
      {
        time: "6:00 PM",
        title: "Dancing",
        description: "The Parent dances will kick off the dancing.",
      },
      {
        time: "11:00 PM",
        title: "End of the night",
        description: "The evening ends around 11:00.",
      },
    ],
  },

  menu: {
    title: "The menu",
    lead: "Appetizers, then a buffet at the reception.",
    courses: [
      {
        title: "Appetizers",
        items: [
          {
            name: "Cucumber cups with 3 Sisters salad",
            detail: "Lemon vinaigrette",
            note: "Vegan, gluten-free",
          },
          {
            name: "Roasted venison skewers",
            detail: "Rosemary demi-glace",
            note: "Gluten-free",
          },
          {
            name: "Smoky salmon cakes",
            detail: "Lemon dill aioli",
            note: "Contains gluten and dairy",
          },
        ],
      },
      {
        title: "Dinner buffet",
        items: [
          {
            name: "Seared and roasted Northwest tribal-caught salmon filet",
            note: "Gluten-free, dairy-free",
          },
          {
            name: "Pot-roast style braised bison",
            note: "Gluten-free, dairy-free",
          },
          {
            name: "Cracked Yukon Gold potatoes with nettle pesto and forest herbs, wintertime",
            note: "Gluten-free, dairy-free",
          },
          {
            name: "3 Sisters with butternut squash, lacinato kale, Ojibwe wild rice, kidney beans, and fresh roasted corn",
            note: "Vegan, gluten-free",
          },
          {
            name: "Fresh baked honey corn muffins",
            detail: "Butter on the side",
            note: "Contains gluten and dairy",
          },
          {
            name: "Mixed baby lettuces with cedar cider dressing and toasted pepitas",
            note: "Vegan, gluten-free",
          },
        ],
      },
    ],
  },

  travel: {
    eyebrow: "Travel & stay",
    title: "Getting there",
    intro:
      "About a half hour north from the ceremony to the reception. Sea-Tac is the larger airport. Paine Field, in Everett, is the closer option.",
    hotels: [
      {
        name: "Silver Cloud Hotel — Mukilteo Waterfront",
        detail:
          "On the waterfront, a short distance from the reception. Book directly with the hotel.",
        url: "https://www.silvercloud.com/mukilteo/",
      },
    ],
    parking: "",
  },

  registry: {
    eyebrow: "Registry",
    title: "Gifts",
    intro:
      "Being there is the gift. If you'd like to mark the day with something more, we registered in one place.",
    pageIntro:
      "We gathered everything in one registry — a honeymoon fund, things for the house, and a few experiences. Checkout happens on Zola.",
    url: "https://www.zola.com/registry/ethanandamandajanuary23",
    teaserCta: "See the registry",
    cta: "Browse the full registry",
    ctaShort: "Zola",
    successCta: "We've registered with Zola",
    rsvpPrompt: {
      title: "Zola has the gifts",
      body: "We have the RSVP. Their site opens in a new tab, and this page stays right here.",
      rsvpCta: "RSVP first",
      continueCta: "Show me Zola",
    },
    /** Each item can set `url` to a specific Zola collection; otherwise it uses `registry.url`. */
    featured: [
      {
        label: "Honeymoon",
        detail:
          "A contribution toward the trip — getting there, dinners, days off.",
      },
      {
        label: "Home",
        detail: "Pieces we'd use every day, from the kitchen to the table.",
      },
      {
        label: "Experiences",
        detail: "Things to do together after the wedding, not things to unwrap.",
      },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "A few things to know",
    items: [
      {
        question: "What should I wear?",
        answer:
          "Formal. A suit or a floor-length dress, in whatever color you like.",
        images: [
          {
            src: "/wedding/attire-men.png",
            alt: "Formal suit ideas in navy, gray, green, burgundy, and black, with ties and bow ties.",
            label: "Suits",
          },
          {
            src: "/wedding/attire-women.png",
            alt: "Floor-length formal dress ideas in jewel tones, pastels, and black.",
            label: "Dresses",
          },
        ],
      },
      {
        question: "Can I wear white?",
        answer: "Only if you are Amanda.",
      },
      {
        question: "Can I bring a plus one?",
        answer:
          "If your invitation includes a plus one, they'll be listed with your group.",
      },
      {
        question: "Are kids welcome?",
        answer:
          "Kids will be allowed at the ceremony but not be at the reception. If you need an exception, let us know.",
      },
      {
        question: "Can I bring alcohol?",
        answer: "No outside alcohol.",
      },
      {
        question: "Can I bring a firearm?",
        answer: "No. Both locations are firearm-free.",
      },
      {
        question: "When should I RSVP by?",
        answer: "Please reply by December 15, 2026.",
      },
    ],
  },

  rsvp: {
    eyebrow: "RSVP",
    title: "Will you be there?",
    intro:
      "Find the name on your invitation, then reply for each person.",
    searchTitle: "Whose invitation is it?",
    searchHint: "Type a first or last name and we'll find your group.",
    groupIntro:
      "Reply for each person below.",
    openIntro:
      "Reply for yourself, or add each person you're answering for.",
    deadline: "Please RSVP by December 15, 2026.",
    repliedNoTitle: "We'll miss you",
    thanksEyebrow: "RSVP",
    thanksReady: "You're all set",
    thanksTitle: "Thank you",
    successNo: "We'll miss you — thank you for letting us know.",
    thanksRegistry:
      "If you'd like to celebrate with a gift, we've registered with Zola.",
  },

  footer: {
    note: "With love,",
    year: "2027",
  },

  gallery: [
    "/wedding/wedding-01.png",
    "/wedding/wedding-02.png",
    "/wedding/wedding-03.png",
    "/wedding/wedding-04.png",
    "/wedding/wedding-05.png",
    "/wedding/wedding-06.png",
    "/wedding/wedding-07.png",
  ],
} as const;

export function comingLine(count: number) {
  if (count >= 3) return "We can't wait to see you all";
  if (count === 2) return "We can't wait to see you both";
  return "We can't wait to see you";
}

export type WeddingContent = typeof weddingContent;
