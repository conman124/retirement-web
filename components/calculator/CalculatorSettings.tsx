import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { SettingsGroup, Setting, EditButton } from "./SettingsGroup";
import {
    Gender,
    JobSettings,
    PersonSettings,
    RatesSource,
    TaxSettings,
    setSeed,
    setCount,
    isSimulationReady,
} from "../../store/simulator";
import {
    CalculatorSettingsSubpageProps,
    Subpage,
} from "../../pages/calculator";
import React from "react";

function pluralize(number: number, word: string, plural?: string) {
    if (number == 1) {
        return `1 ${word}`;
    }
    if (plural) {
        return `${number} ${plural}`;
    }
    return `${number} ${word}s`;
}

function personSubtext(
    { ageYears, ageMonths, deathRates }: PersonSettings,
    careerPeriods
) {
    let ret = pluralize(ageYears, "year");

    let retireMonthsTotal = ageYears * 12 + ageMonths + careerPeriods;
    let retireYears = Math.floor(retireMonthsTotal / 12);

    ret += `, retire at ${retireYears}, `;

    ret += deathRates.gender === Gender.Male ? "male" : "female";
    ret += " mortality table";

    return ret;
}

function jobSubtext({
    startingAnnualGrossIncome,
    fica,
    raiseSettings,
    accountContributionSettings,
}: JobSettings) {
    let salaryDesc = startingAnnualGrossIncome.toLocaleString(undefined, {
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        style: "currency",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    salaryDesc += "/yr";

    let ficaDesc = "";
    if (fica.type === "exempt") {
        ficaDesc = ", no Social Security";
    }

    let raiseDesc = ", ";
    raiseDesc += Math.round(raiseSettings.amount * 100 - 100) + "% raise";
    if (raiseSettings.adjustForInflation) {
        raiseDesc += " + inflation";
    }

    return salaryDesc + ficaDesc + raiseDesc;
}

function ratesSubtext(rates: RatesSource, ratesSublength: number) {
    let type;
    if (rates == "builtin") {
        type = "Built-in";
    } else {
        type = "Custom";
    }
    return `${type} market rates, subperiod length ${ratesSublength}`;
}

function taxesSubtext(taxes: TaxSettings) {
    if (taxes) {
        let ret = "";
        switch (taxes.filingStatus) {
            case "head_of_household":
                ret += "Head of household, ";
                break;
            case "married_joint":
                ret += "Married filing jointly, ";
                break;
            case "single":
                ret += "Single, ";
                break;
        }
        if (
            !taxes.adjustBracketFloorsForInflation &&
            !taxes.adjustBracketFloorsForInflation
        ) {
            ret += "don't adjust for inflation";
        } else if (
            taxes.adjustBracketFloorsForInflation &&
            taxes.adjustDeductionForInflation
        ) {
            ret += "adjust brackets and deduction for inflation";
        } else if (taxes.adjustBracketFloorsForInflation) {
            ret += "adjust brackets for inflation";
        } else {
            ret += "adjust deduction for inflation";
        }
        return ret;
    }
    return "";
}

export default function CalculatorSettings(
    props: CalculatorSettingsSubpageProps
) {
    const person = useAppSelector((state) => state.simulation.person);
    const careerPeriods = useAppSelector(
        (state) => state.simulation.careerPeriods
    );
    const job = useAppSelector((state) => state.simulation.job);
    const rates = useAppSelector((state) => state.simulation.rates);
    const ratesSublength = useAppSelector(
        (state) => state.simulation.ratesSublength
    );
    const taxes = useAppSelector((state) => state.simulation.taxSettings);
    const runCount = useAppSelector((state) => state.simulation.count);
    const seed = useAppSelector((state) => state.simulation.seed);
    const readyToRun = useAppSelector(isSimulationReady);
    const dispatch = useAppDispatch();

    let personSub = "";
    if (person) {
        personSub = personSubtext(person, careerPeriods);
    }

    let jobSub = "";
    if (job) {
        jobSub = jobSubtext(job);
    }

    let ratesSub = ratesSubtext(rates, ratesSublength);

    let taxSub = "";
    if (taxes) {
        taxSub = taxesSubtext(taxes);
    }

    return (
        <div className="relative">
            <SettingsGroup title="Calculator Settings">
                <Setting name="Person" subtext={personSub}>
                    <EditButton
                        onClick={() => props.changeSubpage(Subpage.PERSON)}
                    />
                </Setting>
                <Setting name="Job" subtext={jobSub}>
                    <EditButton
                        onClick={() => props.changeSubpage(Subpage.JOB)}
                    />
                </Setting>
                <Setting name="Market rates" subtext={ratesSub}>
                    <EditButton />
                </Setting>
                <Setting name="Taxes" subtext={taxSub}>
                    <EditButton
                        onClick={() => props.changeSubpage(Subpage.TAX)}
                    />
                </Setting>
                <Setting name="Run count">
                    <input
                        type="number"
                        min="1"
                        placeholder="Run count"
                        className="input input-bordered w-full max-w-xs"
                        value={runCount}
                        onChange={(e) =>
                            dispatch(setCount(parseInt(e.target.value) || 1))
                        }
                    />
                </Setting>
                <Setting name="Seed">
                    <input
                        type="number"
                        placeholder="Seed"
                        className="input input-bordered w-full max-w-xs"
                        value={typeof seed === "undefined" ? "" : seed}
                        onChange={(e) =>
                            dispatch(
                                setSeed(parseInt(e.target.value) || undefined)
                            )
                        }
                    />
                </Setting>
            </SettingsGroup>
            <button
                className="absolute right-0 m-3 btn btn-secondary"
                onClick={props.runSimulations}
                disabled={!readyToRun}
            >
                Run simulation
            </button>
        </div>
    );
}
