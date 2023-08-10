import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import * as WasmTypes from "@conman124/retirement";

export type AssetAllocation =
    | {
          type: "linear";
          periodsBefore: number;
          startStocks: number;
          periodsGlide: number;
          endStocks: number;
      }
    | {
          type: "custom";
          stockRates: number[];
      };

export type AccountSettings = {
    startingBalance: number;
    // TODO add allocation
    //allocation: AssetAllocation;
};

export { AccountContributionSource } from "@conman124/retirement";

export { AccountContributionTaxability } from "@conman124/retirement";

export type AccountContributionSettings = {
    accountSettings: AccountSettings;
    contributionPercent: number;
    contributionSource: WasmTypes.AccountContributionSource;
    tax: WasmTypes.AccountContributionTaxability;
};

export type RaiseSettings = {
    amount: number;
    adjustForInflation: boolean;
};

export type Fica =
    | {
          type: "participant";
          ssRate: number;
      }
    | {
          type: "exempt";
      };

export type JobSettings = {
    startingAnnualGrossIncome: number;
    fica: Fica;
    raiseSettings: RaiseSettings;
    accountContributionSettings: AccountContributionSettings[];
};

export { Gender } from "@conman124/retirement";

export type DeathRates = {
    type: "builtin";
    gender: WasmTypes.Gender;
};

export type PersonSettings = {
    ageYears: number;
    ageMonths: number;
    deathRates: DeathRates;
};

export type TaxSettings = {
    filingStatus: "single" | "married_joint" | "head_of_household";
    adjustBracketFloorsForInflation: boolean;
    adjustDeductionForInflation: boolean;
};

export type RatesSource =
    | "builtin"
    | {
          stocks: number[];
          bonds: number[];
          inflation: number[];
      };

export type Simulation = {
    seed: number | undefined;
    count: number;
    rates: RatesSource;
    ratesSublength: number;
    job: JobSettings;
    person: PersonSettings;
    careerPeriods: number;
    taxSettings: TaxSettings;
};

export type PartialSimulation = Omit<
    Simulation,
    "job" | "person" | "taxSettings"
> & {
    job: JobSettings | null;
    person: PersonSettings | null;
    taxSettings: TaxSettings | null;
};

const initialState: PartialSimulation = {
    seed: undefined,
    count: 1000,
    rates: "builtin",
    ratesSublength: 12,
    job: null,
    person: null,
    careerPeriods: 0,
    taxSettings: null,
};

export const simulationSlice = createSlice({
    name: "simulation",
    initialState,
    reducers: {
        setSeed: (state, action: PayloadAction<number | undefined>) => {
            state.seed = action.payload;
        },
        setCount: (state, action: PayloadAction<number>) => {
            state.count = action.payload;
        },
        setRates: (state, action: PayloadAction<RatesSource>) => {
            state.rates = action.payload;
        },
        setRatesSublength: (state, action: PayloadAction<number>) => {
            state.ratesSublength = action.payload;
        },
        setJob: (state, action: PayloadAction<JobSettings>) => {
            state.job = action.payload;
        },
        setPerson: (state, action: PayloadAction<PersonSettings>) => {
            state.person = action.payload;
        },
        setCareerPeriods: (state, action: PayloadAction<number>) => {
            state.careerPeriods = action.payload;
        },
        setTaxSettings: (state, action: PayloadAction<TaxSettings>) => {
            state.taxSettings = action.payload;
        },
        setSimulation: (state, action: PayloadAction<Simulation>) => {
            return action.payload;
        },
    },
});

export const {
    setSeed,
    setCount,
    setRates,
    setRatesSublength,
    setJob,
    setPerson,
    setCareerPeriods,
    setTaxSettings,
    setSimulation,
} = simulationSlice.actions;

export const actionCreators = simulationSlice.actions;

export default simulationSlice.reducer;
