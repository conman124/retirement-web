import deathCSV from "../data/test_death.csv";
import ratesCSV from "../data/test_rates.csv";

// Due to a bug in the original regression that this is based on, we have to skip the
// first entry in the death rates
let deathRates = Float64Array.from(
    deathCSV
        .split("\n")
        .map((a) => parseFloat(a))
        .slice(1)
);
let rates = ratesCSV
    .split("\n")
    .slice(1)
    .map((csv) => {
        return csv.split(",").map((a) => parseFloat(a));
    });
let stocks = Float64Array.from(rates.map((a) => a[0]));
let bonds = Float64Array.from(rates.map((a) => a[1]));
let inflation = Float64Array.from(rates.map((a) => a[2]));

export function testingSimulation(
    retirement: typeof import("@conman124/retirement")
) {
    const {
        AccountContributionSettings,
        AccountContributionSettingsVec,
        AccountContributionSource,
        AccountContributionTaxability,
        AccountSettings,
        AssetAllocation,
        FicaJS,
        JobSettings,
        PersonSettings,
        RaiseSettings,
        RatesSourceHolder,
        Simulation,
        TaxSettings,
    } = retirement;

    let assetAllocation = AssetAllocation.new_linear_glide(
        1,
        0.83,
        (110 - 27) * 12,
        0.0
    );
    let accountSettings = new AccountSettings(50000.0, assetAllocation);
    let accountContributionSettings = new AccountContributionSettings(
        accountSettings,
        0.15,
        AccountContributionSource.Employee,
        AccountContributionTaxability.PostTax
    );
    let raiseSettings = new RaiseSettings(1.05, true);
    let allAccountContributionSettings = new AccountContributionSettingsVec();
    allAccountContributionSettings.add(accountContributionSettings);
    let jobSettings = new JobSettings(
        129000 / 12,
        FicaJS.exempt(),
        raiseSettings,
        allAccountContributionSettings
    );
    let personSettings = PersonSettings.new_with_custom_death_rates(
        27,
        0,
        deathRates
    );
    let taxSettings = new TaxSettings(
        new Float64Array([0, 10275, 41775, 89075, 170050, 215950, 539900]),
        new Float64Array([0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37]),
        true,
        12950,
        true
    );
    let simulation = new Simulation(
        BigInt(1337),
        100,
        RatesSourceHolder.new_from_custom_split(stocks, bonds, inflation),
        12,
        jobSettings,
        personSettings,
        (65 - 27) * 12,
        taxSettings
    );

    return simulation;
}
