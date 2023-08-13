import TAX_RATES from "../data/tax";
import * as d3 from "d3";
import { Simulation as SimulationSettings } from "../store/simulator";
import { getTextDimensions } from "./textDim";

const ANIMATION_RUNWAY_TIME = 2000;
const ANIMATION_TOTAL_TIME = 0;

export function getSimulationFromSettings(
    retirement: typeof import("@conman124/retirement"),
    simulationSettings: SimulationSettings
) {
    const {
        AccountContributionSettings,
        AccountContributionSettingsVec,
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

    const accountContributionSettingsVec = new AccountContributionSettingsVec();
    simulationSettings.job.accountContributionSettings.forEach((s) => {
        const startingStocks =
            (110 - Math.min(simulationSettings.person.ageYears, 110)) / 100;
        const stockPeriods =
            110 * 12 -
            Math.min(
                simulationSettings.person.ageYears * 12 +
                    simulationSettings.person.ageMonths,
                110 * 12
            );
        const assetAllocation = AssetAllocation.new_linear_glide(
            1,
            startingStocks,
            stockPeriods,
            0
        );

        const accountSettings = new AccountSettings(
            s.accountSettings.startingBalance,
            assetAllocation
        );
        const accountContributionSettings = new AccountContributionSettings(
            accountSettings,
            s.contributionPercent,
            s.contributionSource,
            s.tax
        );
        accountContributionSettingsVec.add(accountContributionSettings);
    });

    const raiseSettings = new RaiseSettings(
        simulationSettings.job.raiseSettings.amount,
        simulationSettings.job.raiseSettings.adjustForInflation
    );
    const jobSettings = new JobSettings(
        simulationSettings.job.startingAnnualGrossIncome / 12,
        FicaJS.exempt(),
        raiseSettings,
        accountContributionSettingsVec
    );
    const personSettings = PersonSettings.new_with_default_death_rates(
        simulationSettings.person.ageYears,
        simulationSettings.person.ageMonths,
        simulationSettings.person.deathRates.gender
    );
    let selectedTax: typeof TAX_RATES.settings.single;
    if (simulationSettings.taxSettings.filingStatus == "single") {
        selectedTax = TAX_RATES.settings.single;
    } else if (
        simulationSettings.taxSettings.filingStatus == "head_of_household"
    ) {
        selectedTax = TAX_RATES.settings.head_of_household;
    } else {
        selectedTax = TAX_RATES.settings.married_joint;
    }
    const tax = new TaxSettings(
        new Float64Array(selectedTax.bracketFloors),
        new Float64Array(selectedTax.bracketRates),
        simulationSettings.taxSettings.adjustBracketFloorsForInflation,
        selectedTax.standardDeduction,
        simulationSettings.taxSettings.adjustDeductionForInflation
    );

    const simulation = new Simulation(
        BigInt(
            typeof simulationSettings.seed === "undefined"
                ? Math.floor(Math.random() * 100000)
                : simulationSettings.seed
        ),
        simulationSettings.count,
        RatesSourceHolder.new_from_builtin(),
        12,
        jobSettings,
        personSettings,
        simulationSettings.careerPeriods,
        tax
    );

    return simulation;
}

export function graph(
    simulation: import("@conman124/retirement").Simulation,
    svgEl: SVGElement,
    showSimCount: number,
    width: number,
    height: number,
    abbreviateLabels: boolean
) {
    let maxLen = 0;
    let maxBalance = 0;
    for (let i = 0; i < showSimCount; ++i) {
        let balance = simulation.get_account_balance_for_run(i, 0); // TODO need to add all balances
        maxLen = Math.max(maxLen, balance.length);
        maxBalance = Math.max(maxBalance, d3.max(balance));
    }

    let dates = [];
    let curDate = new Date();
    for (let i = 0; i < maxLen; ++i) {
        dates[i] = new Date(curDate.getFullYear(), curDate.getMonth() + i, 1);
    }

    const moneyFormat = abbreviateLabels ? "$,.0s" : "$,.0f";

    const maxBalanceText = d3.format(moneyFormat)(maxBalance);
    const textWidth = getTextDimensions(maxBalanceText, [
        "font-sans",
        "text-sm",
    ]).width;
    const textHeight = getTextDimensions("2020", [
        "font-sans",
        "text-sm",
    ]).actualBoundingBoxAscent;

    const margin = {
        left: textWidth + 10,
        bottom: textHeight + 10,
        right: 10,
        top: 10,
    };

    const svg = d3.select(svgEl).attr("width", width).attr("height", height);

    const time = d3
        .scaleUtc()
        .domain([dates[0], dates[dates.length - 1]])
        .range([margin.left, width - margin.right]);
    const money = d3
        .scaleLinear()
        .domain([0, maxBalance])
        .range([height - margin.bottom, margin.top]);
    const line = d3
        .line()
        .x(([, d]) => time(d))
        .y(([d]) => money(d));

    for (let i = 0; i < showSimCount; ++i) {
        const data_joined = Array.prototype.map.call(
            simulation.get_account_balance_for_run(i, 0), // TODO need to add all balances
            (balance, index) => [balance, dates[index]]
        );
        const successful =
            simulation.assets_adequate_periods_for_run(i) >=
            simulation.lifespan_for_run(i).periods();

        svg.append("path")
            .attr("fill", "none")
            .attr(
                "stroke",
                successful ? "rgba(0, 255, 0, 0.4)" : "rgb(255, 0, 0, 0.4)"
            )
            .attr("stroke-width", "1")
            .attr("stroke-miterlimit", "1")
            .attr("stroke-dasharray", "0,1")
            .attr("d", line(data_joined))
            .transition()
            .delay(ANIMATION_RUNWAY_TIME * (i / showSimCount))
            .duration(function () {
                const pct =
                    simulation.assets_adequate_periods_for_run(i) / maxLen;
                return (ANIMATION_TOTAL_TIME - ANIMATION_RUNWAY_TIME) * pct;
            })
            .ease(d3.easeLinear)
            .attrTween("stroke-dasharray", function () {
                const length = this.getTotalLength();
                return d3.interpolate(`0,${length}`, `${length},${length}`);
            })
            .attrTween("stroke", () =>
                d3.interpolate(
                    "rgba(128, 128, 128, 0.4)",
                    successful ? "rgba(0, 255, 0, 0.4)" : "rgb(255, 0, 0, 0.4)"
                )
            );
    }

    function styleAxes(el) {
        return el
            .attr("font-family", "")
            .attr("font-size", "")
            .attr("class", "font-sans text-sm");
    }

    const xAxis = (g) => {
        g.attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(time))
            .call(styleAxes);
    };
    const yAxis = (g) => {
        g.attr("transform", `translate(${margin.left},0)`)
            .attr("class", "font-sans")
            .call(d3.axisLeft(money).ticks(5, moneyFormat))
            .call(styleAxes);
    };
    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);
}
