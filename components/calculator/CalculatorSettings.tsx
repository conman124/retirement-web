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
} from "../../store/simulator";
import { Subpage } from "../../pages/calculator";

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
  if (ageMonths >= 6) {
    ++ageYears;
  }
  let ret = pluralize(ageYears, "year");

  let retireMonthsTotal = ageYears * 12 + ageMonths + careerPeriods;
  let retireYears = Math.floor(retireMonthsTotal / 12);
  let retireMonths = retireMonthsTotal % 12;
  if (retireMonths >= 6) {
    ++retireYears;
  }

  ret += `, retire at ${retireYears}, `;

  if (deathRates.type == "builtin") {
    ret += deathRates.gender === Gender.Male ? "male" : "female";
  } else {
    ret += "custom";
  }
  ret += " mortality table";

  return ret;
}

function jobSubtext({
  startingGrossIncome,
  fica,
  raiseSettings,
  accountContributionSettings,
}: JobSettings) {
  let salaryDesc = startingGrossIncome.toLocaleString(undefined, {
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
  raiseDesc += Math.round(raiseSettings.amount * 100) + "% raise";
  if (raiseSettings.adjustForInflation) {
    raiseDesc += " + inflation";
  }

  let accountsDesc =
    ", " + pluralize(accountContributionSettings.length, "account");

  return salaryDesc + ficaDesc + raiseDesc + accountsDesc;
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
    return "Tax settings entered";
  }
}

type CalculatorSettingsProps = { onChangeSubpage: (Subpage) => void };

export default function CalculatorSettings(props: CalculatorSettingsProps) {
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
    <SettingsGroup title="Calculator Settings">
      <Setting name="Person" subtext={personSub}>
        <EditButton onClick={() => props.onChangeSubpage(Subpage.PERSON)} />
      </Setting>
      <Setting name="Job" subtext={jobSub}>
        <EditButton />
      </Setting>
      <Setting name="Market rates" subtext={ratesSub}>
        <EditButton />
      </Setting>
      <Setting name="Taxes" subtext={taxSub}>
        <EditButton />
      </Setting>
      <Setting name="Run count">
        <input
          type="number"
          min="1"
          placeholder="Run count"
          className="input input-bordered w-full max-w-xs"
          value={runCount}
          onChange={(e) => dispatch(setCount(parseInt(e.target.value) || 1))}
        />
      </Setting>
      <Setting name="Seed">
        <input
          type="number"
          placeholder="Seed"
          className="input input-bordered w-full max-w-xs"
          value={typeof seed === "undefined" ? "" : seed}
          onChange={(e) =>
            dispatch(setSeed(parseInt(e.target.value) || undefined))
          }
        />
      </Setting>
    </SettingsGroup>
  );
}
