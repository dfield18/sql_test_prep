import React, { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';

// Questions grouped by difficulty
const QUESTIONS = {
  easy: [
    {
      prompt: 'Which stations are in Manhattan? Show the station name only.',
      summary: 'Filter stations by borough',
      solution: `SELECT name
FROM stations
WHERE borough = "Manhattan";`,
      hint: 'Use a SELECT statement to choose the name column from the stations table. Add a WHERE clause to filter rows where the borough is "Manhattan". The basic structure is: SELECT column FROM table WHERE condition;.'
    },
    {
      prompt: 'List all station names and their boroughs.',
      summary: 'Select and list columns',
      solution: `SELECT name, borough
FROM stations;`,
      hint: 'Use SELECT to choose multiple columns (name and borough) from the stations table. You do not need a WHERE clause since you want all rows. Example: SELECT column1, column2 FROM table;.'
    },
    {
      prompt: 'Show all transaction records for station_id 1.',
      summary: 'Filter transaction by station_id',
      solution: `SELECT *
FROM transactions
WHERE station_id = 1;`,
      hint: 'Use SELECT * to get all columns from the transactions table. Add a WHERE clause to filter for rows where station_id is 1. Example: SELECT * FROM table WHERE column = value;.'
    },
    {
      prompt: 'How many stations are in each borough?',
      summary: 'Group by and count',
      solution: `SELECT borough, COUNT(*) as station_count
FROM stations
GROUP BY borough;`,
      hint: 'Use SELECT to choose the borough column and COUNT(*) to count stations. Use GROUP BY borough to group the results by each borough. Example: SELECT group_column, COUNT(*) FROM table GROUP BY group_column;.'
    },
    {
      prompt: 'What is the name of the station with id 10?',
      summary: 'Filter by id',
      solution: `SELECT name
FROM stations
WHERE id = 10;`,
      hint: 'Use SELECT to get the name column from stations. Add a WHERE clause to filter for id = 10. Example: SELECT column FROM table WHERE id = value;.'
    },
    {
      prompt: 'Show all station IDs and names.',
      summary: 'Select all station IDs and names',
      solution: `SELECT id, name
FROM stations;`,
      hint: 'Use SELECT to choose both id and name columns from the stations table. No WHERE clause is needed. Example: SELECT column1, column2 FROM table;.'
    },
    {
      prompt: 'Which stations are in Queens? Show the station name only.',
      summary: 'Filter stations by borough (Queens)',
      solution: `SELECT name
FROM stations
WHERE borough = "Queens";`,
      hint: 'Use SELECT to get the name column from stations. Add a WHERE clause to filter for borough = "Queens". Example: SELECT column FROM table WHERE column = value;.'
    },
    {
      prompt: 'List all transaction records for 2024-06-02.',
      summary: 'Filter transaction by date',
      solution: `SELECT *
FROM transactions
WHERE date = "2024-06-02";`,
      hint: 'Use SELECT * to get all columns from transactions. Add a WHERE clause to filter for date = "2024-06-02". Example: SELECT * FROM table WHERE column = value;.'
    },
    {
      prompt: 'How many stations are in the Bronx?',
      summary: 'Count stations in Bronx',
      solution: `SELECT COUNT(*) as bronx_stations
FROM stations
WHERE borough = "Bronx";`,
      hint: 'Use SELECT with COUNT(*) to count rows. Add a WHERE clause to filter for borough = "Bronx". Example: SELECT COUNT(*) FROM table WHERE column = value;.'
    },
    {
      prompt: 'What is the name of the station with id 15?',
      summary: 'Find station by id',
      solution: `SELECT name
FROM stations
WHERE id = 15;`,
      hint: 'Use SELECT to get the name column from stations. Add a WHERE clause to filter for id = 15. Example: SELECT column FROM table WHERE id = value;.'
    },
  ],
  medium: [
    {
      prompt: 'What is the total transaction for each station? Show station_id and total transaction.',
      summary: 'Group by and sum',
      solution: `SELECT station_id, SUM(revenue) as total_transaction
FROM transactions
GROUP BY station_id;`,
      hint: 'Use SELECT to choose station_id and SUM(revenue) to add up transaction for each station. Use GROUP BY station_id to group the results. Example: SELECT column, SUM(column2) FROM table GROUP BY column;.'
    },
    {
      prompt: 'Which station had the highest transaction on 2024-06-01?',
      summary: 'Order by and limit',
      solution: `SELECT station_id, revenue
FROM transactions
WHERE date = '2024-06-01'
ORDER BY revenue DESC
LIMIT 1;`,
      hint: 'First, use WHERE to filter for date = "2024-06-01". Then, use ORDER BY revenue DESC to sort by transaction from highest to lowest. Use LIMIT 1 to get only the top result. Example: SELECT ... FROM ... WHERE ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'List the names of stations in Queens with total transaction over 22000.',
      summary: 'Join, group by, having',
      solution: `SELECT s.name
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE s.borough = 'Queens'
GROUP BY s.id
HAVING SUM(t.revenue) > 22000;`,
      hint: 'Use a JOIN to combine stations and transactions tables. Use WHERE to filter for borough = "Queens". Use GROUP BY s.id to group by station, and HAVING SUM(t.revenue) > 22000 to filter groups. Example: SELECT ... FROM ... JOIN ... ON ... WHERE ... GROUP BY ... HAVING ...;.'
    },
    {
      prompt: 'How many days of transaction data are there for each station?',
      summary: 'Count distinct and group by',
      solution: `SELECT station_id, COUNT(DISTINCT date) as days_reported
FROM transactions
GROUP BY station_id;`,
      hint: 'Use SELECT to choose station_id and COUNT(DISTINCT date) to count unique days. Use GROUP BY station_id to group results. Example: SELECT column, COUNT(DISTINCT column2) FROM table GROUP BY column;.'
    },
    {
      prompt: 'What is the average transaction per day for station_id 5?',
      summary: 'Average with filter',
      solution: `SELECT AVG(revenue) as avg_transaction
FROM transactions
WHERE station_id = 5;`,
      hint: 'Use SELECT with AVG(revenue) to calculate the average. Add a WHERE clause to filter for station_id = 5. Example: SELECT AVG(column) FROM table WHERE column2 = value;.'
    },
    {
      prompt: 'Which stations had transaction above 9000 on 2024-06-01?',
      summary: 'Filter transaction by value and date',
      solution: `SELECT station_id
FROM transactions
WHERE revenue > 9000
  AND date = "2024-06-01";`,
      hint: 'Use WHERE to filter for revenue > 9000 and date = "2024-06-01". Combine conditions with AND. Example: SELECT column FROM table WHERE column1 > value AND column2 = value;.'
    },
    {
      prompt: 'What is the total transaction for all stations in Brooklyn?',
      summary: 'Join, filter, sum',
      solution: `SELECT SUM(t.revenue) as total_brooklyn_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE s.borough = "Brooklyn";`,
      hint: 'Use a JOIN to combine stations and transactions. Use WHERE to filter for borough = "Brooklyn". Use SUM to add up transaction. Example: SELECT SUM(column) FROM ... JOIN ... ON ... WHERE ...;.'
    },
    {
      prompt: 'List the station names and their total transaction for 2024-06-03.',
      summary: 'Join, filter by date, group by',
      solution: `SELECT s.name, SUM(t.revenue) as total_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE t.date = "2024-06-03"
GROUP BY s.id;`,
      hint: 'Use a JOIN to combine stations and transactions. Use WHERE to filter for date = "2024-06-03". Use GROUP BY s.id to group by station, and SUM to add up transaction. Example: SELECT ... FROM ... JOIN ... ON ... WHERE ... GROUP BY ...;.'
    },
    {
      prompt: 'How many stations have transaction records for all three days?',
      summary: 'Group by, count, having',
      solution: `SELECT station_id
FROM transactions
GROUP BY station_id
HAVING COUNT(DISTINCT date) = 3;`,
      hint: 'Use GROUP BY station_id to group records. Use HAVING COUNT(DISTINCT date) = 3 to keep only stations with 3 unique dates. Example: SELECT ... FROM ... GROUP BY ... HAVING COUNT(DISTINCT ...) = 3;.'
    },
    {
      prompt: 'What is the minimum transaction recorded for station_id 8?',
      summary: 'Aggregate, filter',
      solution: `SELECT MIN(revenue) as min_transaction
FROM transactions
WHERE station_id = 8;`,
      hint: 'Use SELECT with MIN(revenue) to find the smallest value. Add a WHERE clause to filter for station_id = 8. Example: SELECT MIN(column) FROM table WHERE column2 = value;.'
    },
  ],
  hard: [
    {
      prompt: 'For each borough, what is the average transaction per station (sum all transaction for all stations in the borough, divide by number of stations)?',
      summary: 'Join, group by, aggregate',
      solution: `SELECT s.borough, SUM(t.revenue)/COUNT(DISTINCT s.id) as avg_transaction_per_station
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.borough;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.borough to group by borough. Use SUM to add up transaction and COUNT(DISTINCT s.id) to count stations. Divide SUM by COUNT for the average. Example: SELECT ..., SUM(...)/COUNT(DISTINCT ...) FROM ... JOIN ... ON ... GROUP BY ...;.'
    },
    {
      prompt: 'Which station had the largest single-day transaction, and what was the amount?',
      summary: 'Join, order by, limit',
      solution: `SELECT s.name, t.revenue
FROM stations s
JOIN transactions t ON s.id = t.station_id
ORDER BY t.revenue DESC
LIMIT 1;`,
      hint: 'Use a JOIN to combine stations and transactions. Use ORDER BY t.revenue DESC to sort by transaction from highest to lowest. Use LIMIT 1 to get the top result. Example: SELECT ... FROM ... JOIN ... ON ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'List the names of stations that had transaction above 13000 on any day.',
      summary: 'Join, filter, distinct',
      solution: `SELECT DISTINCT s.name
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE t.revenue > 13000;`,
      hint: 'Use a JOIN to combine stations and transactions. Use WHERE to filter for revenue > 13000. Use SELECT DISTINCT to avoid duplicate names. Example: SELECT DISTINCT ... FROM ... JOIN ... ON ... WHERE ...;.'
    },
    {
      prompt: 'Which borough has the highest total transaction?',
      summary: 'Join, group by, order by, limit',
      solution: `SELECT s.borough, SUM(t.revenue) as total_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.borough
ORDER BY total_transaction DESC
LIMIT 1;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.borough to group by borough. Use SUM to add up transaction. Use ORDER BY SUM(t.revenue) DESC to sort, and LIMIT 1 for the top. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'Find the station(s) with the lowest total transaction.',
      summary: 'Join, group by, order by asc, limit',
      solution: `SELECT s.name, SUM(t.revenue) as total_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id
ORDER BY total_transaction ASC
LIMIT 1;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.id to group by station. Use SUM to add up transaction. Use ORDER BY SUM(t.revenue) ASC to sort from lowest to highest, and LIMIT 1 for the lowest. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... ORDER BY ... ASC LIMIT 1;.'
    },
    {
      prompt: 'Which station had the second highest total transaction?',
      summary: 'Group by, order by, limit with offset',
      solution: `SELECT s.name, SUM(t.revenue) as total_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id
ORDER BY total_transaction DESC
LIMIT 1 OFFSET 1;`,
      hint: 'Use GROUP BY s.id to group by station. Use SUM to add up transaction. Use ORDER BY total_transaction DESC to sort from highest to lowest. Use LIMIT 1 OFFSET 1 to get the second result. Example: SELECT ... FROM ... GROUP BY ... ORDER BY ... DESC LIMIT 1 OFFSET 1;.'
    },
    {
      prompt: 'For each station, what is the difference between the highest and lowest transaction recorded?',
      summary: 'Group by, aggregate, difference',
      solution: `SELECT s.name, MAX(t.revenue) - MIN(t.revenue) as transaction_diff
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.id to group by station. Use MAX and MIN to get the highest and lowest transaction, then subtract. Example: SELECT ..., MAX(...) - MIN(...) FROM ... JOIN ... ON ... GROUP BY ...;.'
    },
    {
      prompt: 'Which stations had an average transaction above 10000?',
      summary: 'Group by, average, filter',
      solution: `SELECT s.name
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id
HAVING AVG(t.revenue) > 10000;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.id to group by station. Use HAVING AVG(t.revenue) > 10000 to filter groups. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... HAVING AVG(...) > value;.'
    },
    {
      prompt: 'For each borough, what is the total number of transaction records?',
      summary: 'Join, group by, count',
      solution: `SELECT s.borough, COUNT(t.revenue) as num_records
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.borough;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.borough to group by borough. Use COUNT to count transaction records. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ...;.'
    },
    {
      prompt: 'Which station(s) had transaction below 8000 on any day?',
      summary: 'Join, filter, distinct',
      solution: `SELECT DISTINCT s.name
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE t.revenue < 8000;`,
      hint: 'Use a JOIN to combine stations and transactions. Use WHERE to filter for revenue < 8000. Use SELECT DISTINCT to avoid duplicate names. Example: SELECT DISTINCT ... FROM ... JOIN ... ON ... WHERE ...;.'
    },
  ],
  superhard: [
    {
      prompt: 'Which station had the largest increase in transaction from 2024-06-01 to 2024-06-02?',
      summary: 'Self-join, difference, order by',
      solution: `SELECT s.name, (t2.revenue - t1.revenue) as increase
FROM stations s
JOIN transactions t1 ON s.id = t1.station_id AND t1.date = "2024-06-01"
JOIN transactions t2 ON s.id = t2.station_id AND t2.date = "2024-06-02"
ORDER BY increase DESC
LIMIT 1;`,
      hint: 'Use a self-join to join the transactions table to itself for two different dates. Subtract t1.revenue from t2.revenue to get the increase. Use ORDER BY increase DESC to sort, and LIMIT 1 for the largest. Example: SELECT ... FROM ... JOIN ... ON ... JOIN ... ON ... WHERE ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'Which station(s) had the same transaction on all three days?',
      summary: 'Group by, min=max',
      solution: `SELECT s.name
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id
HAVING MIN(t.revenue) = MAX(t.revenue);`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.id to group by station. Use HAVING MIN(t.revenue) = MAX(t.revenue) to find stations where all transaction values are the same. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... HAVING MIN(...) = MAX(...);.'
    },
    {
      prompt: 'Find the average daily transaction for each borough.',
      summary: 'Join, group by, average',
      solution: `SELECT s.borough, AVG(t.revenue) as avg_daily_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.borough;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.borough to group by borough. Use AVG to calculate the average. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ...;.'
    },
    {
      prompt: 'Which station had the highest average transaction per day?',
      summary: 'Group by, average, order by, limit',
      solution: `SELECT s.name, AVG(t.revenue) as avg_transaction
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id
ORDER BY avg_transaction DESC
LIMIT 1;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.id to group by station. Use AVG to calculate the average. Use ORDER BY AVG(t.revenue) DESC to sort, and LIMIT 1 for the highest. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'Which borough has the most stations with at least one day of transaction above 12000?',
      summary: 'Join, filter, group by, count distinct, order by, limit',
      solution: `SELECT s.borough, COUNT(DISTINCT s.id) as num_stations
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE t.revenue > 12000
GROUP BY s.borough
ORDER BY num_stations DESC
LIMIT 1;`,
      hint: 'Use a JOIN to combine stations and transactions. Use WHERE to filter for revenue > 12000. Use GROUP BY s.borough to group by borough. Use COUNT(DISTINCT s.id) to count unique stations. Use ORDER BY num_stations DESC to sort, and LIMIT 1 for the most. Example: SELECT ... FROM ... JOIN ... ON ... WHERE ... GROUP BY ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'Which station had the smallest increase in transaction from 2024-06-01 to 2024-06-02?',
      summary: 'Self-join, difference, order by asc',
      solution: `SELECT s.name, (t2.revenue - t1.revenue) as increase
FROM stations s
JOIN transactions t1 ON s.id = t1.station_id AND t1.date = "2024-06-01"
JOIN transactions t2 ON s.id = t2.station_id AND t2.date = "2024-06-02"
ORDER BY increase ASC
LIMIT 1;`,
      hint: 'Use a self-join to join the transactions table to itself for two different dates. Subtract t1.revenue from t2.revenue to get the increase. Use ORDER BY increase ASC to sort, and LIMIT 1 for the smallest. Example: SELECT ... FROM ... JOIN ... ON ... JOIN ... ON ... WHERE ... ORDER BY ... ASC LIMIT 1;.'
    },
    {
      prompt: 'Which station(s) had transaction that increased every day?',
      summary: 'Group by, compare, having',
      solution: `SELECT s.name
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.id
HAVING MIN(t.revenue) < MAX(t.revenue)
   AND COUNT(DISTINCT t.revenue) = 3;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.id to group by station. Use HAVING to check that the minimum transaction is less than the maximum and that there are three distinct transaction values. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... HAVING MIN(...) < MAX(...) AND COUNT(DISTINCT ...) = 3;.'
    },
    {
      prompt: 'For each station, what is the total transaction for the first two days?',
      summary: 'Group by, filter by date, sum',
      solution: `SELECT s.name, SUM(t.revenue) as total_first_two_days
FROM stations s
JOIN transactions t ON s.id = t.station_id
WHERE t.date IN ("2024-06-01", "2024-06-02")
GROUP BY s.id;`,
      hint: 'Use a JOIN to combine stations and transactions. Use WHERE with IN to filter for the first two dates. Use GROUP BY s.id to group by station, and SUM to add up transaction. Example: SELECT ... FROM ... JOIN ... ON ... WHERE ... IN (...) GROUP BY ...;.'
    },
    {
      prompt: 'Which borough had the largest difference between its highest and lowest single-day transaction?',
      summary: 'Join, group by, aggregate, difference',
      solution: `SELECT s.borough, MAX(t.revenue) - MIN(t.revenue) as diff
FROM stations s
JOIN transactions t ON s.id = t.station_id
GROUP BY s.borough
ORDER BY diff DESC
LIMIT 1;`,
      hint: 'Use a JOIN to combine stations and transactions. Use GROUP BY s.borough to group by borough. Use MAX and MIN to get the highest and lowest transaction, then subtract. Use ORDER BY diff DESC to sort, and LIMIT 1 for the largest. Example: SELECT ... FROM ... JOIN ... ON ... GROUP BY ... ORDER BY ... DESC LIMIT 1;.'
    },
    {
      prompt: 'Which station(s) had the same transaction on the first and last day?',
      summary: 'Self-join, compare',
      solution: `SELECT s.name
FROM stations s
JOIN transactions t1 ON s.id = t1.station_id AND t1.date = "2024-06-01"
JOIN transactions t2 ON s.id = t2.station_id AND t2.date = "2024-06-03"
WHERE t1.revenue = t2.revenue;`,
      hint: 'Use a self-join to join the transactions table to itself for the first and last day. Compare t1.revenue and t2.revenue in the WHERE clause. Example: SELECT ... FROM ... JOIN ... ON ... JOIN ... ON ... WHERE ... = ...;.'
    },
  ]
};

const SAMPLE_SQL = QUESTIONS['easy'][0].solution;

const STATIONS_DATA = [
  { id: 1, name: 'Times Sq - 42 St', borough: 'Manhattan' },
  { id: 2, name: 'Grand Central - 42 St', borough: 'Manhattan' },
  { id: 3, name: 'Flushing - Main St', borough: 'Queens' },
  { id: 4, name: 'Atlantic Av - Barclays Ctr', borough: 'Brooklyn' },
  { id: 5, name: 'Yankee Stadium - 161 St', borough: 'Bronx' },
  { id: 6, name: '34 St - Penn Station', borough: 'Manhattan' },
  { id: 7, name: '125 St', borough: 'Manhattan' },
  { id: 8, name: 'Jackson Hts - Roosevelt Av', borough: 'Queens' },
  { id: 9, name: 'Coney Island - Stillwell Av', borough: 'Brooklyn' },
  { id: 10, name: 'Fordham Rd', borough: 'Bronx' },
  { id: 11, name: 'Lexington Av - 59 St', borough: 'Manhattan' },
  { id: 12, name: 'Queensboro Plaza', borough: 'Queens' },
  { id: 13, name: 'Jay St - MetroTech', borough: 'Brooklyn' },
  { id: 14, name: 'Pelham Bay Park', borough: 'Bronx' },
  { id: 15, name: '86 St', borough: 'Manhattan' },
  { id: 16, name: 'Astoria - Ditmars Blvd', borough: 'Queens' },
  { id: 17, name: 'Church Av', borough: 'Brooklyn' },
  { id: 18, name: '3 Av - 149 St', borough: 'Bronx' },
  { id: 19, name: 'Canal St', borough: 'Manhattan' },
  { id: 20, name: 'Jamaica Center - Parsons/Archer', borough: 'Queens' },
];

const REVENUE_DATA = [
  // 2 days for each of the 20 stations
  ...Array.from({ length: 20 }, (_, i) => [
    { station_id: i + 1, date: '2024-06-01', revenue: 7000 + (i * 500) },
    { station_id: i + 1, date: '2024-06-02', revenue: 7200 + (i * 500) },
    { station_id: i + 1, date: '2024-06-03', revenue: 7300 + (i * 500) },
  ]).flat(),
];

function renderTable(rows, title, onSort, sortColumn, sortDirection) {
  if (!rows || rows.length === 0) return <div>No data</div>;
  const columns = Object.keys(rows[0]);

  // Sort rows if a sort column is selected
  let sortedRows = rows;
  if (sortColumn) {
    sortedRows = [...rows].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Detect if this is the stations table
  const isStationsTable = title === 'stations';

  return (
    <div style={{ marginBottom: 32 }}>
      {title && <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>{title}</h3>}
      <div style={{
        maxHeight: 375,
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: 4,
        boxSizing: 'border-box',
        background: '#fff',
        padding: 0,
        overflowX: isStationsTable ? 'visible' : 'auto',
      }}>
        <table border="1" style={{
          width: isStationsTable ? '100%' : 'auto',
          tableLayout: isStationsTable ? 'fixed' : 'auto',
          fontSize: '18px',
          fontFamily: 'JetBrains Mono, Fira Mono, monospace',
          letterSpacing: '0.2px',
        }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  style={{
                    padding: isStationsTable ? '8px 8px' : '10px 18px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    position: 'sticky',
                    top: 0,
                    background: '#fafdff',
                    zIndex: 2,
                    boxShadow: '0 2px 4px 0 rgba(60, 100, 180, 0.04)',
                    cursor: onSort ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={onSort ? () => onSort(col) : undefined}
                >
                  {col}
                  {sortColumn === col && (
                    <span style={{ marginLeft: 6 }}>
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i}>
                {columns.map(col => <td key={col} style={{ padding: isStationsTable ? '6px 8px' : '8px 18px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[col]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function rowsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const rowA = a[i];
    const rowB = b[i];
    const keysA = Object.keys(rowA);
    const keysB = Object.keys(rowB);
    if (keysA.length !== keysB.length) return false;
    for (let k of keysA) {
      if (rowA[k] !== rowB[k]) return false;
    }
  }
  return true;
}

export default function App() {
  const [SQL, setSQL] = useState(null);
  const [db, setDb] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  // Sorting state for stations and transactions tables
  const [stationSort, setStationSort] = useState({ column: null, direction: 'asc' });
  const [transactionSort, setTransactionSort] = useState({ column: null, direction: 'asc' });

  useEffect(() => {
    initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` }).then(SQL => {
      setSQL(SQL);
      const db = new SQL.Database();
      db.run('CREATE TABLE stations (id INTEGER PRIMARY KEY, name TEXT, borough TEXT);');
      db.run('CREATE TABLE transactions (station_id INTEGER, date TEXT, revenue INTEGER);');
      STATIONS_DATA.forEach(station => {
        db.run('INSERT INTO stations VALUES (?, ?, ?);', [station.id, station.name, station.borough]);
      });
      REVENUE_DATA.forEach(rev => {
        db.run('INSERT INTO transactions VALUES (?, ?, ?);', [rev.station_id, rev.date, rev.revenue]);
      });
      setDb(db);
    });
  }, []);

  useEffect(() => {
    setQuery('');
    setResult(null);
    setError(null);
    setFeedback(null);
    setShowAnswer(false);
    setShowHint(false);
  }, [difficulty, questionIdx]);

  const runQuery = () => {
    setError(null);
    setShowHint(false);
    if (!db) return;
    try {
      const res = db.exec(query);
      let feedbackMsg = null;
      if (res.length > 0) {
        const columns = res[0].columns;
        const values = res[0].values;
        const rows = values.map(row => Object.fromEntries(row.map((v, i) => [columns[i], v])));
        setResult(rows);
        // Evaluate answer
        const solutionRes = db.exec(QUESTIONS[difficulty][questionIdx].solution);
        let solutionRows = [];
        if (solutionRes.length > 0) {
          const solCols = solutionRes[0].columns;
          const solVals = solutionRes[0].values;
          solutionRows = solVals.map(row => Object.fromEntries(row.map((v, i) => [solCols[i], v])));
        }
        if (rowsEqual(rows, solutionRows)) {
          feedbackMsg = '✅ Correct!';
          setShowHint(false);
        } else {
          feedbackMsg = '❌ Not quite. Try again!';
          setShowHint(true);
        }
      } else {
        setResult([]);
        feedbackMsg = '❌ Not quite. Try again!';
        setShowHint(true);
      }
      setFeedback(feedbackMsg);
    } catch (e) {
      setError(e.message);
      setResult(null);
      setFeedback(null);
      setShowHint(true);
    }
  };

  // Sorting handlers
  const handleStationSort = (col) => {
    setStationSort(prev => ({
      column: col,
      direction: prev.column === col && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTransactionSort = (col) => {
    setTransactionSort(prev => ({
      column: col,
      direction: prev.column === col && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      flexDirection: 'column',
    }}>
      <div style={{
        width: '100%',
        background: '#e0f7fa',
        color: '#00796b',
        padding: '14px 0',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: 0.2,
        borderBottom: '1px solid #b2ebf2',
      }}>
        🚀 No login required &mdash; this tool is <b>completely free</b>!
      </div>
      <div style={{ width: '100%', maxWidth: 1200, margin: '40px 0 16px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: '#1a2a3a', margin: 0, letterSpacing: -1 }}>
          SQL Interview Practice
        </h1>
        <p style={{ fontSize: 20, color: '#3a4664', margin: '10px 0 0 0', fontWeight: 400 }}>
          Sharpen your SQL skills with real interview questions and interactive practice.
        </p>
      </div>
      <div style={{
        width: '90vw',
        maxWidth: 1200,
        minHeight: '80vh',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 12px 0 rgba(60, 100, 180, 0.06)',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}>
        {/* Left Panel: SQL Editor (50%) */}
        <div style={{
          flex: 5,
          padding: 32,
          borderRight: '1px solid #f1f3f7',
          display: 'flex',
          flexDirection: 'column',
          background: '#fcfdff',
          minWidth: 0,
        }}>
          {/* Difficulty and Question Selection */}
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 17, minWidth: 90 }}>Difficulty:</label>
              <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setQuestionIdx(0); }}
                style={{
                  fontSize: 17,
                  padding: '7px 16px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#f8fafc',
                  color: '#2a3a5a',
                  outline: 'none',
                  minWidth: 110,
                  maxWidth: 160,
                }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="superhard">Super Hard</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <label style={{ fontWeight: 600, fontSize: 17, minWidth: 90 }}>Question:</label>
              <select value={questionIdx} onChange={e => setQuestionIdx(Number(e.target.value))}
                style={{
                  fontSize: 17,
                  padding: '7px 16px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#f8fafc',
                  color: '#2a3a5a',
                  outline: 'none',
                  minWidth: 200,
                  maxWidth: 400,
                  flex: '1 1 220px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {QUESTIONS[difficulty].map((q, idx) => (
                  <option value={idx} key={idx}>{q.summary}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Question Text */}
          <div style={{
            marginBottom: 10,
            background: '#f8fafc',
            padding: 14,
            borderRadius: 8,
            fontSize: 22,
            color: '#1a2a3a',
            fontWeight: 700,
            border: '1px solid #f1f3f7',
            lineHeight: 1.4,
          }}>
            <b>Question:</b> {QUESTIONS[difficulty][questionIdx].prompt}
          </div>
          {/* SQL Editor */}
          <h2 style={{ fontWeight: 700, color: '#1a2a3a', marginBottom: 10, fontSize: 18, letterSpacing: -0.5 }}>SQL Editor</h2>
          <Editor
            value={query}
            onValueChange={setQuery}
            highlight={code => Prism.highlight(code, Prism.languages.sql, 'sql')}
            padding={14}
            style={{
              width: '100%',
              minHeight: '24vh',
              fontFamily: 'JetBrains Mono, Fira Mono, monospace',
              fontSize: 18,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#f8fafc',
              color: '#1a2a3a',
              outline: 'none',
              marginBottom: 8,
              resize: 'vertical',
              whiteSpace: 'pre-wrap',
            }}
          />
          <button
            onClick={runQuery}
            style={{
              marginTop: 6,
              padding: '10px 28px',
              fontSize: 17,
              fontWeight: 600,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              boxShadow: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
          >
            Run
          </button>
          {error && <div style={{ color: '#e74c3c', marginTop: 10, fontWeight: 500, fontSize: 16 }}>{error}</div>}
          {feedback && <div style={{ marginTop: 10, fontWeight: 600, fontSize: 17, color: feedback.startsWith('✅') ? '#16a34a' : '#eab308' }}>{feedback}</div>}
          {result && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ color: '#1a2a3a', fontWeight: 600, fontSize: 18 }}>Result</h3>
              {renderTable(result)}
            </div>
          )}
          {/* Buttons, Hint, and Show Answer remain below */}
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowHint(h => !h)}
              style={{
                padding: '8px 18px',
                fontSize: 15,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                background: showHint ? '#e0e7ef' : '#f8fafc',
                color: '#1a2a3a',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button
              onClick={() => setShowAnswer(a => !a)}
              style={{
                padding: '8px 18px',
                fontSize: 15,
                borderRadius: 6,
                border: '1px solid #2563eb',
                background: showAnswer ? '#e0e7ef' : '#f8fafc',
                color: '#2563eb',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>
          {showHint && (
            <div style={{
              marginTop: 10,
              color: '#2563eb',
              background: '#e0e7ef',
              padding: 10,
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 500,
              border: '1px solid #d1d5db',
            }}>
              <b>Hint:</b> {QUESTIONS[difficulty][questionIdx].hint}
            </div>
          )}
          {showAnswer && (
            <div style={{
              marginTop: 10,
              background: '#f1f5f9',
              padding: 12,
              borderRadius: 6,
              fontFamily: 'JetBrains Mono, Fira Mono, monospace',
              fontSize: 15,
              color: '#2563eb',
              fontWeight: 600,
              border: '1px solid #d1d5db',
            }}>
              <b>Correct SQL:</b>
              <div
                style={{ margin: 0, whiteSpace: 'pre-wrap', marginTop: 6 }}
                dangerouslySetInnerHTML={{
                  __html: Prism.highlight(QUESTIONS[difficulty][questionIdx].solution, Prism.languages.sql, 'sql')
                }}
              />
            </div>
          )}
        </div>
        {/* Right Panel: Sample Data (50%) */}
        <div style={{
          flex: 5,
          padding: 32,
          background: '#fcfdff',
          overflowY: 'auto',
          minWidth: 0,
        }}>
          <h2 style={{ fontWeight: 700, color: '#1a2a3a', marginBottom: 14, fontSize: 22, letterSpacing: -0.5 }}>Data Tables</h2>
          {renderTable(
            STATIONS_DATA,
            'stations',
            handleStationSort,
            stationSort.column,
            stationSort.direction
          )}
          {renderTable(
            REVENUE_DATA,
            'transactions',
            handleTransactionSort,
            transactionSort.column,
            transactionSort.direction
          )}
        </div>
      </div>
      {/* Footer */}
      <div style={{
        position: 'fixed',
        right: 24,
        bottom: 18,
        background: 'rgba(250,252,255,0.97)',
        color: '#3a4664',
        fontSize: 18,
        fontWeight: 500,
        borderRadius: 8,
        boxShadow: '0 2px 8px 0 rgba(60, 100, 180, 0.06)',
        padding: '10px 22px',
        zIndex: 100,
        border: '1px solid #e5e7eb',
        letterSpacing: 0.1,
        pointerEvents: 'auto',
        userSelect: 'text',
      }}>
        For questions or feedback, contact <a href="mailto:sqlquestguide@gmail.com" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600, fontSize: 18 }}>sqlquestguide@gmail.com</a>
      </div>
    </div>
  );
} 