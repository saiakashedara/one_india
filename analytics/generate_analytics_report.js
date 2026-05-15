const fs = require("fs");
const path = require("path");

const outDir = __dirname;

function parseCsv(fileName) {
  const text = fs.readFileSync(path.join(outDir, fileName), "utf8").trim();
  const [headerLine, ...lines] = text.split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return headers.reduce((row, header, index) => {
      const raw = values[index] || "";
      const numeric = Number(raw);
      row[header] = raw !== "" && !Number.isNaN(numeric) ? numeric : raw;
      return row;
    }, {});
  });
}

const users = parseCsv("user_growth_metrics.csv");
const financials = parseCsv("financial_metrics.csv");
const endpoints = parseCsv("endpoint_statistics.csv").filter((row) => row.ENDPOINT !== "TOTAL");
const endpointTotal = parseCsv("endpoint_statistics.csv").find((row) => row.ENDPOINT === "TOTAL");
const api = parseCsv("api_performance_data.csv");
const projections = parseCsv("business_projections.csv");

const latestUser = users[users.length - 1];
const latestFinancial = financials[financials.length - 1];
const firstFinancial = financials[0];
const slowestEndpoint = [...endpoints].sort((a, b) => b.AVERAGE_RESPONSE_TIME_MS - a.AVERAGE_RESPONSE_TIME_MS)[0];
const mostUsedEndpoint = [...endpoints].sort((a, b) => b.TOTAL_REQUESTS - a.TOTAL_REQUESTS)[0];
const avgApiResponse = Math.round(api.reduce((sum, row) => sum + row.response_time_ms, 0) / api.length);
const avgCacheHit = Math.round(api.reduce((sum, row) => sum + row.redis_cache_hit_rate_percent, 0) / api.length);
const revenueGrowth = Math.round(((latestFinancial.TOTAL_REVENUE_INR - firstFinancial.TOTAL_REVENUE_INR) / firstFinancial.TOTAL_REVENUE_INR) * 100);
const transactionSuccessRate = ((latestFinancial.SUCCESSFUL_TRANSACTIONS / (latestFinancial.SUCCESSFUL_TRANSACTIONS + latestFinancial.FAILED_TRANSACTIONS)) * 100).toFixed(1);
const kycRate = ((latestUser.KYC_COMPLETED / latestUser.ACTIVE_USERS) * 100).toFixed(1);

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function formatInr(value) {
  return `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 1 })}`;
}

function points(rows, xKey, yKey, width, height, padding) {
  const values = rows.map((row) => Number(row[yKey]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return rows
    .map((row, index) => {
      const x = padding + (index / (rows.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((Number(row[yKey]) - min) / span) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function lineChart(title, rows, yKey, color, formatter = formatNumber) {
  const width = 760;
  const height = 260;
  const padding = 48;
  const values = rows.map((row) => Number(row[yKey]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  return `
    <section class="chart">
      <div class="chart-heading">
        <h3>${title}</h3>
        <span>${formatter(values[0])} to ${formatter(values[values.length - 1])}</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="axis" />
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="axis" />
        <text x="${padding}" y="28" class="tick">${formatter(max)}</text>
        <text x="${padding}" y="${height - 16}" class="tick">${formatter(min)}</text>
        <polyline points="${points(rows, "DATE", yKey, width, height, padding)}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        ${rows.map((row, index) => {
          const [x, y] = points([row], "DATE", yKey, width, height, padding).split(",").map(Number);
          const fixedX = padding + (index / (rows.length - 1 || 1)) * (width - padding * 2);
          const fixedY = height - padding - ((Number(row[yKey]) - min) / (max - min || 1)) * (height - padding * 2);
          return `<circle cx="${fixedX.toFixed(1)}" cy="${fixedY.toFixed(1)}" r="4" fill="${color}" />`;
        }).join("")}
      </svg>
    </section>`;
}

function barChart(title, rows, labelKey, valueKey, color, formatter = formatNumber) {
  const width = 760;
  const height = 300;
  const padding = 52;
  const max = Math.max(...rows.map((row) => Number(row[valueKey])));
  const barWidth = (width - padding * 2) / rows.length - 10;
  return `
    <section class="chart">
      <div class="chart-heading">
        <h3>${title}</h3>
        <span>Highest: ${formatter(max)}</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="axis" />
        ${rows.map((row, index) => {
          const value = Number(row[valueKey]);
          const barHeight = (value / max) * (height - padding * 2);
          const x = padding + index * ((width - padding * 2) / rows.length) + 5;
          const y = height - padding - barHeight;
          const label = String(row[labelKey]).replace("/api/", "");
          return `
            <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="3" fill="${color}" />
            <text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 30}" class="tick small" text-anchor="middle">${label.length > 13 ? label.slice(0, 12) + "." : label}</text>
          `;
        }).join("")}
      </svg>
    </section>`;
}

function projectionChart() {
  const rows = projections.filter((row) => ["Daily Active Users", "Platform Revenue INR", "API Uptime %", "Average Response Time ms"].includes(row.METRIC));
  return `
    <section class="chart full">
      <div class="chart-heading">
        <h3>Q1 Projection Progress</h3>
        <span>January baseline against Q1 targets</span>
      </div>
      <div class="projection-grid">
        ${rows.map((row) => {
          const value = Number(row.JANUARY_DATA);
          const target = Number(row.Q1_TARGET);
          const ratio = row.METRIC.includes("Response Time") ? target / value : value / target;
          const percent = Math.max(4, Math.min(100, ratio * 100));
          return `
            <div class="projection">
              <div>
                <strong>${row.METRIC}</strong>
                <span>${formatNumber(value)} current / ${formatNumber(target)} target</span>
              </div>
              <div class="bar"><i style="width:${percent}%"></i></div>
            </div>`;
        }).join("")}
      </div>
    </section>`;
}

function tableRows(rows) {
  return rows.map((row) => `
    <tr>
      <td>${row.ENDPOINT}</td>
      <td>${formatNumber(row.TOTAL_REQUESTS)}</td>
      <td>${formatNumber(row.AVERAGE_RESPONSE_TIME_MS)} ms</td>
      <td>${formatNumber(row.P95_RESPONSE_TIME_MS)} ms</td>
      <td>${formatNumber(row.UPTIME_PERCENT)}%</td>
    </tr>`).join("");
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>OneIndia Analytics Report</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #172033; background: #f6f8fb; line-height: 1.45; }
    main { max-width: 980px; margin: 0 auto; padding: 28px; background: #fff; }
    header { border-bottom: 4px solid #137c8b; padding-bottom: 22px; margin-bottom: 24px; }
    h1 { font-size: 36px; margin: 0 0 8px; letter-spacing: 0; }
    h2 { font-size: 22px; margin: 28px 0 12px; color: #0f5f6c; break-after: avoid; }
    h3 { margin: 0; font-size: 15px; color: #172033; }
    p { margin: 6px 0 12px; }
    .subtitle { color: #5b6475; font-size: 15px; max-width: 760px; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
    .card { border: 1px solid #d9e2ec; border-radius: 8px; padding: 14px; background: #fbfdff; min-height: 118px; }
    .card b { display: block; color: #5b6475; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .card strong { display: block; font-size: 24px; margin-top: 8px; color: #103f46; }
    .card span { display: block; font-size: 12px; margin-top: 8px; color: #5b6475; }
    .insights { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .insight { border-left: 4px solid #f59f00; padding: 8px 12px; background: #fff8ea; }
    .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .chart { border: 1px solid #d9e2ec; border-radius: 8px; padding: 14px; background: #fff; break-inside: avoid; }
    .chart.full { grid-column: 1 / -1; }
    .chart-heading { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 8px; }
    .chart-heading span { color: #647084; font-size: 12px; }
    .axis { stroke: #ccd6e0; stroke-width: 1; }
    .tick { fill: #687386; font-size: 12px; }
    .tick.small { font-size: 9px; }
    svg { width: 100%; height: auto; display: block; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; break-inside: avoid; }
    th, td { border-bottom: 1px solid #e3e8ef; padding: 8px; text-align: left; }
    th { background: #edf6f7; color: #123f46; }
    .projection-grid { display: grid; gap: 12px; }
    .projection { display: grid; grid-template-columns: 240px 1fr; gap: 16px; align-items: center; }
    .projection strong, .projection span { display: block; }
    .projection span { color: #647084; font-size: 12px; }
    .bar { height: 16px; background: #edf1f5; border-radius: 999px; overflow: hidden; }
    .bar i { display: block; height: 100%; background: linear-gradient(90deg, #137c8b, #31a36f); }
    .powerbi { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .step { border: 1px solid #d9e2ec; border-radius: 8px; padding: 12px; background: #fbfdff; }
    .step b { color: #0f5f6c; }
    .page-break { break-before: page; }
    footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #d9e2ec; color: #647084; font-size: 11px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>OneIndia Analytics Report</h1>
      <p class="subtitle">Statistics, operational trends, financial performance, endpoint health, and Power BI visualization guidance based on CSV datasets in the analytics folder.</p>
    </header>

    <h2>Executive Snapshot</h2>
    <div class="cards">
      <div class="card"><b>Active Users</b><strong>${formatNumber(latestUser.ACTIVE_USERS)}</strong><span>${formatNumber(latestUser.USER_REGISTRATIONS)} new registrations on latest day</span></div>
      <div class="card"><b>Platform Revenue</b><strong>${formatInr(latestFinancial.TOTAL_REVENUE_INR)}</strong><span>${revenueGrowth}% growth from day 1</span></div>
      <div class="card"><b>API Uptime</b><strong>${formatNumber(endpointTotal.UPTIME_PERCENT)}%</strong><span>${formatNumber(endpointTotal.FAILED_REQUESTS)} failed requests out of ${formatNumber(endpointTotal.TOTAL_REQUESTS)}</span></div>
      <div class="card"><b>Transaction Success</b><strong>${transactionSuccessRate}%</strong><span>${formatNumber(latestFinancial.P2P_TRANSFERS)} latest-day P2P transfers</span></div>
    </div>

    <div class="insights">
      <div class="insight"><strong>Growth signal:</strong> Active users reached ${formatNumber(latestUser.ACTIVE_USERS)} and retention improved to ${latestUser.RETENTION_RATE_PERCENT}%.</div>
      <div class="insight"><strong>Operational risk:</strong> ${slowestEndpoint.ENDPOINT} is the slowest endpoint at ${slowestEndpoint.AVERAGE_RESPONSE_TIME_MS} ms average response time.</div>
      <div class="insight"><strong>Traffic concentration:</strong> ${mostUsedEndpoint.ENDPOINT} has the highest tracked API traffic with ${formatNumber(mostUsedEndpoint.TOTAL_REQUESTS)} requests.</div>
      <div class="insight"><strong>KYC gap:</strong> KYC completion is ${kycRate}% of active users, making onboarding completion a key product metric.</div>
    </div>

    <h2>Statistical Graphs</h2>
    <div class="charts">
      ${lineChart("Active User Growth", users, "ACTIVE_USERS", "#137c8b")}
      ${lineChart("Platform Revenue Trend", financials, "TOTAL_REVENUE_INR", "#31a36f", formatInr)}
      ${barChart("Endpoint Response Time", endpoints, "ENDPOINT", "AVERAGE_RESPONSE_TIME_MS", "#f59f00", (value) => `${formatNumber(value)} ms`)}
      ${barChart("Endpoint Request Volume", endpoints, "ENDPOINT", "TOTAL_REQUESTS", "#536dfe")}
      ${lineChart("Average Transaction Value", financials, "AVERAGE_TRANSACTION_INR", "#c44636", formatInr)}
      ${lineChart("Retention Rate", users, "RETENTION_RATE_PERCENT", "#7b4ab8", (value) => `${formatNumber(value)}%`)}
      ${projectionChart()}
    </div>

    <h2 class="page-break">Endpoint Performance Table</h2>
    <table>
      <thead>
        <tr><th>Endpoint</th><th>Total Requests</th><th>Avg Response</th><th>P95 Response</th><th>Uptime</th></tr>
      </thead>
      <tbody>${tableRows(endpoints)}</tbody>
    </table>

    <h2>Power BI Visualization Plan</h2>
    <div class="powerbi">
      <div class="step"><b>1. Import data</b><p>Use Get Data > Text/CSV and import all five CSV files from the analytics folder.</p></div>
      <div class="step"><b>2. Build measures</b><p>Create success rate, KYC completion rate, revenue per transaction, and performance category measures.</p></div>
      <div class="step"><b>3. Create pages</b><p>Use pages for Executive Overview, Technical Performance, Business Metrics, and Q1 Projections.</p></div>
      <div class="step"><b>4. Add slicers</b><p>Add date, endpoint, status, and performance category slicers for interactive exploration.</p></div>
      <div class="step"><b>5. Apply thresholds</b><p>Use conditional formatting for response time above 200 ms, uptime below 99%, and error rate above 2%.</p></div>
      <div class="step"><b>6. Publish</b><p>Publish to Power BI Service, schedule daily refresh, and pin KPI cards to a stakeholder dashboard.</p></div>
    </div>

    <h2>Recommended Power BI Visuals</h2>
    <table>
      <thead><tr><th>Dashboard Area</th><th>Visual</th><th>Fields</th><th>Purpose</th></tr></thead>
      <tbody>
        <tr><td>Executive</td><td>KPI cards</td><td>ACTIVE_USERS, TOTAL_REVENUE_INR, UPTIME_PERCENT</td><td>Show business health at a glance.</td></tr>
        <tr><td>Growth</td><td>Line chart</td><td>DATE, ACTIVE_USERS, RETURNING_USERS</td><td>Track adoption and retention movement.</td></tr>
        <tr><td>Revenue</td><td>Combo chart</td><td>DATE, TOTAL_VOLUME_INR, SUCCESSFUL_TRANSACTIONS</td><td>Compare volume growth with reliability.</td></tr>
        <tr><td>Technical</td><td>Bar chart</td><td>ENDPOINT, AVERAGE_RESPONSE_TIME_MS</td><td>Rank slow endpoints for optimization.</td></tr>
        <tr><td>Reliability</td><td>Matrix</td><td>ENDPOINT, UPTIME_PERCENT, P95_RESPONSE_TIME_MS</td><td>Spot SLA risk quickly.</td></tr>
        <tr><td>Forecast</td><td>Progress bars</td><td>JANUARY_DATA, MARCH_PROJECTION, Q1_TARGET</td><td>Monitor Q1 target progress.</td></tr>
      </tbody>
    </table>

    <footer>
      Generated from OneIndia analytics CSV files. Latest source date: ${latestUser.DATE}. Average sampled API response: ${avgApiResponse} ms. Average cache hit rate: ${avgCacheHit}%.
    </footer>
  </main>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, "oneindia_analytics_report.html"), html);
console.log("Generated oneindia_analytics_report.html");
