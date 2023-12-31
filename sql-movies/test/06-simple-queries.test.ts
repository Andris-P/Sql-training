import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Simple Queries", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("05", "06");
  }, minutes(3));

  it(
    "should select total budget and revenue from movies, by using adjusted financial data",
    async done => {
      const query = `SELECT
      ROUND(SUM(budget_adjusted), 2) AS total_budget,
      ROUND(SUM(revenue_adjusted), 2) AS total_revenue
      FROM movies;`;

      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        total_budget: 53668223285.94,
        total_revenue: 148342748033.4
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select count from movies where budget was more than 100000000 and release date after 2009",
    async done => {
      const query = ` SELECT COUNT(*) AS count
      FROM movies
      WHERE budget > 100000000
      AND CAST(SUBSTR(release_date, 1, 4) AS INTEGER) >= 2009;`;

      const result = await db.selectSingleRow(query);

      expect(result.count).toBe(87);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three movies order by budget where release data is after 2009",
    async done => {
      const query = `SELECT original_title, budget, revenue
      FROM movies
      WHERE CAST(SUBSTR(release_date, 1, 4) AS INTEGER) > 2009
      ORDER BY budget DESC
      LIMIT 3;`;

      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          original_title: "The Warrior's Way",
          budget: 425000000.0,
          revenue: 11087569.0
        },
        {
          original_title: "Avengers: Age of Ultron",
          budget: 280000000,
          revenue: 1405035767
        },
        {
          original_title: "Tangled",
          budget: 260000000,
          revenue: 591794936
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of movies where homepage is secure (starts with https)",
    async done => {
      const query = `SELECT COUNT(*) as count
      FROM movies
      WHERE homepage LIKE 'https%';`;

      const result = await db.selectSingleRow(query);

      expect(result.count).toBe(42);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of movies released every year",
    async done => {
      const query = `SELECT strftime('%Y', release_date) as year, COUNT(*) as count
      FROM movies
      GROUP BY strftime('%Y', release_date)
      ORDER BY year DESC;`;

      const result = await db.selectMultipleRows(query);

      expect(result.length).toBe(8);
      expect(result.slice(0, 3)).toEqual([
        {
          count: 627,
          year: "2015"
        },
        {
          count: 696,
          year: "2014"
        },
        {
          count: 487,
          year: "2010"
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three users which left most ratings",
    async done => {
      const query = `SELECT user_id, COUNT(*) as count
      FROM movie_ratings
      GROUP BY user_id
      ORDER BY count DESC
      LIMIT 3;`;
      
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          user_id: 8659,
          count: 48
        },
        {
          user_id: 45811,
          count: 45
        },
        {
          user_id: 179792,
          count: 40
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of ratings left each month",
    async done => {
      const query = `SELECT
      COUNT(*) as count,
      SUBSTR(time_created, 6, 2) as month
  FROM
      movie_ratings
  GROUP BY
      SUBSTR(time_created, 6, 2)
  ORDER BY
      CASE
          WHEN month = '01' THEN 4
          WHEN month = '02' THEN 11
          WHEN month = '03' THEN 6
          WHEN month = '04' THEN 10
          WHEN month = '05' THEN 8
          WHEN month = '06' THEN 7
          WHEN month = '07' THEN 5
          WHEN month = '08' THEN 9
          WHEN month = '09' THEN 12
          WHEN month = '10' THEN 3
          WHEN month = '11' THEN 1
          WHEN month = '12' THEN 2
      END;`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          count: 16521,
          month: "11"
        },
        {
          count: 16479,
          month: "12"
        },
        {
          count: 15175,
          month: "10"
        },
        {
          count: 14619,
          month: "01"
        },
        {
          count: 14557,
          month: "07"
        },
        {
          count: 14080,
          month: "03"
        },
        {
          count: 13655,
          month: "06"
        },
        {
          count: 13071,
          month: "05"
        },
        {
          count: 12812,
          month: "08"
        },
        {
          count: 12623,
          month: "04"
        },
        {
          count: 11765,
          month: "02"
        },
        {
          count: 10502,
          month: "09"
        }
      ]);

      done();
    },
    minutes(3)
  );
});
