import TAX_RATES from "../data/tax.js";
import * as d3 from "d3";
import { memoize } from "underscore";
import { Simulation as SimulationSettings } from "../store/simulator.js";
import { CachedCanvasFactory, getTextDimensions } from "./textDim.js";
export { default as graphSizes } from "./sizes.js";

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
        FicaJS.exempt(), // TODO
        raiseSettings,
        accountContributionSettingsVec
    );
    const personSettings = PersonSettings.new_with_default_death_rates(
        simulationSettings.person.ageYears,
        simulationSettings.person.ageMonths,
        simulationSettings.person.deathRates.gender
    );
    //let selectedTax: typeof TAX_RATES.settings.single;
    // if (simulationSettings.taxSettings.filingStatus == "single") {
    //     selectedTax = TAX_RATES.settings.single;
    // } else if (
    //     simulationSettings.taxSettings.filingStatus == "head_of_household"
    // ) {
    //     selectedTax = TAX_RATES.settings.head_of_household;
    // } else {
    //     selectedTax = TAX_RATES.settings.married_joint;
    // }
    // TODO reenable taxes
    const tax = new TaxSettings(
        new Float64Array([0]),
        new Float64Array([0]),
        false,
        0,
        false
    );

    const simulation = new Simulation(
        BigInt(simulationSettings.seed),
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

export function createGraph(
    simulation: import("@conman124/retirement").Simulation,
    svgEl: SVGElement,
    showSimCount: number,
    width: number,
    height: number,
    abbreviateLabels: boolean,
    {
        ANIMATION_RUNWAY_TIME,
        ANIMATION_TIME,
    }: { ANIMATION_RUNWAY_TIME: number; ANIMATION_TIME: number },
    window: Window,
    canvasFactory: CachedCanvasFactory
) {
    const ANIMATION_TOTAL_TIME = ANIMATION_RUNWAY_TIME + ANIMATION_TIME;

    let lifetime = 0;
    let maxBalance = 0;
    for (let i = 0; i < showSimCount; ++i) {
        let balance = simulation.get_account_balance_for_run(i, 0); // TODO need to add all balances
        lifetime = Math.max(lifetime, balance.length);
        maxBalance = Math.max(maxBalance, d3.max(balance));
    }

    let dates = [];
    let curDate = new Date();
    for (let i = 0; i < lifetime; ++i) {
        dates[i] = new Date(curDate.getFullYear(), curDate.getMonth() + i, 1);
    }

    const moneyFormat = abbreviateLabels ? "$,.0s" : "$,.0f";

    const maxBalanceText = d3.format(moneyFormat)(maxBalance);
    const textWidth = getTextDimensions(
        maxBalanceText,
        ["font-sans", "text-sm"],
        window,
        canvasFactory
    ).width;
    const textHeight = getTextDimensions(
        "2020",
        ["font-sans", "text-sm"],
        window,
        canvasFactory
    ).actualBoundingBoxAscent;

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
        .range([margin.left, width - margin.right]); // TODO pick better spacing for small
    const money = d3
        .scaleLinear()
        .domain([0, maxBalance])
        .range([height - margin.bottom, margin.top]);
    const line = d3
        .line()
        .x(([, d]) => time(d))
        .y(([d]) => money(d));

    const successful = [];

    for (let i = 0; i < showSimCount; ++i) {
        const data_joined = Array.prototype.map.call(
            simulation.get_account_balance_for_run(i, 0), // TODO need to add all balances
            (balance, index) => [balance, dates[index]]
        );
        successful.push(
            simulation.assets_adequate_periods_for_run(i) >=
                simulation.lifespan_for_run(i).periods()
        );

        svg.append("path")
            .attr("fill", "none")
            .attr("stroke-width", "1")
            .attr("stroke-miterlimit", "1")
            .attr("d", line(data_joined));
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

    const successful_interpolator = d3.interpolate(
        "rgba(128, 128, 128, 0.4)",
        "rgba(0, 255, 0, 0.4)"
    );
    const unsuccessful_interpolator = d3.interpolate(
        "rgba(128, 128, 128, 0.4)",
        "rgb(255, 0, 0, 0.4)"
    );

    function update(t_in) {
        svg.selectChildren("path").each((_, i, paths: SVGPathElement[]) => {
            const t_unscaled = t_in * ANIMATION_TOTAL_TIME;
            const delay = ANIMATION_RUNWAY_TIME * (i / showSimCount);
            let t_undelayed;
            if (delay >= t_unscaled) {
                t_undelayed = 0;
            } else {
                t_undelayed = (t_unscaled - delay) / ANIMATION_TIME;
                t_undelayed = Math.min(Math.max(0, t_undelayed), 1);
            }
            const t = d3.easeLinear(t_undelayed);
            const length = paths[i].getTotalLength();

            d3.select(paths[i]).attr(
                "stroke-dasharray",
                d3.interpolate(`0,${length}`, `${length},${length}`)(t)
            );
            d3.select(paths[i]).attr(
                "stroke",
                (successful[i]
                    ? successful_interpolator
                    : unsuccessful_interpolator)(t)
            );
        });
    }

    update(0);

    return {
        svg,
        update,
    };
}

const defaultCanvasFactory = memoize(() => {
    return window.document.createElement("canvas");
});

export function graph(
    simulation: import("@conman124/retirement").Simulation,
    svgEl: SVGElement,
    showSimCount: number,
    width: number,
    height: number,
    abbreviateLabels: boolean,
    {
        ANIMATION_RUNWAY_TIME,
        ANIMATION_TIME,
    }: { ANIMATION_RUNWAY_TIME: number; ANIMATION_TIME: number }
) {
    const ANIMATION_TOTAL_TIME = ANIMATION_RUNWAY_TIME + ANIMATION_TIME;

    const { update } = createGraph(
        simulation,
        svgEl,
        showSimCount,
        width,
        height,
        abbreviateLabels,
        { ANIMATION_RUNWAY_TIME, ANIMATION_TIME },
        window,
        defaultCanvasFactory
    );

    const timer = d3.timer((elapsed) => {
        const t = Math.min(1, elapsed / ANIMATION_TOTAL_TIME);
        update(t);

        if (elapsed >= ANIMATION_TOTAL_TIME) {
            timer.stop();
        }
    });
}

export { testingSimulation } from "./testSettings.js";
