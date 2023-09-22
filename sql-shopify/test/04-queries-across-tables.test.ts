import { Database } from "../src/database";
import { APPS, APPS_CATEGORIES, APPS_PRICING_PLANS, CATEGORIES, PRICING_PLANS } from "../src/shopify-table-names";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("03", "04");
    }, minutes(1));

    it("should select count of apps which have free pricing plan", async done => {

        const query = `SELECT COUNT(*) as count
        FROM apps 
        JOIN apps_pricing_plans ON apps.id = apps_pricing_plans.app_id
        JOIN pricing_plans ON apps_pricing_plans.pricing_plan_id = pricing_plans.id
        WHERE pricing_plans.price LIKE 'Free%' ;`;
        
        const result = await db.selectSingleRow(query);
        expect(result).toEqual({
            count: 1112
        });
        done();
    }, minutes(1));

    it("should select top 3 most common categories", async done => {

        const query = `SELECT COUNT(*) as count, c.title as category
        FROM categories c
        JOIN apps_categories ac ON c.id = ac.category_id
        GROUP BY c.title
        ORDER BY count DESC
        LIMIT 3;`;

        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 1193, category: "Store design" },
            { count: 723, category: "Sales and conversion optimization" },
            { count: 629, category: "Marketing" }
        ]);
        done();
    }, minutes(1));

    it("should select top 3 prices by appearance in apps and in price range from $5 to $10 inclusive (not matters monthly or one time payment)", async done => {
        
        const query = `SELECT COUNT(*) as count, price,
        CASE
        WHEN price LIKE '% %' THEN
            CAST(SUBSTR(price, 2, INSTR(price, ' ') - 2) AS REAL)
          ELSE
            CAST(SUBSTR(price, 2, INSTR(price, '/') - 2) AS REAL)
        END as casted_price
      FROM (
        SELECT app_id, pricing_plan_id, price
        FROM apps_pricing_plans
        JOIN pricing_plans ON apps_pricing_plans.pricing_plan_id = pricing_plans.id
            ) AS _pricing_plans
      WHERE  casted_price >= 5.00 AND casted_price <= 10.00
      GROUP BY casted_price
      ORDER BY count DESC, casted_price
      LIMIT 3;`;

        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 225, price: "$9.99/month", casted_price: 9.99 },
            { count: 135, price: "$5/month", casted_price: 5 },
            { count: 114, price: "$10/month", casted_price: 10 }
        ]);
        done();
    }, minutes(1));
});