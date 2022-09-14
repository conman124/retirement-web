import deathCSV from "../csv/test_death.csv";
import ratesCSV from "../csv/test_rates.csv";
import * as d3 from "d3";

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

const ANIMATION_RUNWAY_TIME = 2000;
const ANIMATION_TOTAL_TIME = 0;

export function graph(
  retirement: typeof import("@conman124/retirement"),
  svgEl: SVGElement,
  showSimCount: number
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

  let maxLen = 0;
  let maxBalance = 0;
  for (let i = 0; i < showSimCount; ++i) {
    let balance = simulation.get_account_balance_for_run(i, 0);
    maxLen = Math.max(maxLen, balance.length);
    maxBalance = Math.max(maxBalance, d3.max(balance));
  }

  let dates = [];
  for (let i = 0; i < maxLen; ++i) {
    dates[i] = new Date(2022, i, 1);
  }

  const margin = { left: 50, bottom: 20, right: 10, top: 10 };
  const width = 600;
  const height = 300;

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
      simulation.get_account_balance_for_run(i, 0),
      (balance, index) => [balance, dates[index]]
    );
    const successful =
      simulation.assets_adequate_periods_for_run(i) >=
      simulation.lifespan_for_run(i).periods();

    svg
      .append("path")
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
        const pct = simulation.assets_adequate_periods_for_run(i) / maxLen;
        console.log((ANIMATION_TOTAL_TIME - ANIMATION_RUNWAY_TIME) * pct);
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

  const xAxis = (g) => {
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3.axisBottom(time).ticks(20)
    );
  };
  const yAxis = (g) => {
    g.attr("transform", `translate(${margin.left},0)`).call(
      d3.axisLeft(money).ticks(5, "$,.0f")
    );
  };
  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);
}
