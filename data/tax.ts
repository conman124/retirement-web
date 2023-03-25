export default {
    year: "2023",
    settings: {
        single: {
            bracketFloors: [0, 11000, 44725, 95375, 182100, 231250, 578125],
            bracketRates: [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
            standardDeduction: 13850,
        },
        married_joint: {
            bracketFloors: [0, 22000, 89450, 190750, 364200, 462500, 693750],
            bracketRates: [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
            standardDeduction: 27700,
        },
        head_of_household: {
            bracketFloors: [0, 15700, 59850, 95350, 182100, 231250, 578100],
            bracketRates: [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
            standardDeduction: 20800,
        },
    },
};
