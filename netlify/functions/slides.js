const { neon } = require('@neondatabase/serverless');

const MODULES = [
  { module: "PHYSICS 101",      table: "slides_physics_101"      },
  { module: "THERMODYNAMICS",   table: "slides_thermodynamics"   },
  { module: "NUCLEAR",          table: "slides_nuclear"          },
  { module: "WAVES",            table: "slides_waves"            },
  { module: "MECHANICS",        table: "slides_mechanics"        },
  { module: "ELECTRICITY",      table: "slides_electricity"      },
  { module: "MAGNETIC EFFECTS", table: "slides_magnetic_effects" },
  { module: "ASTRONOMY",        table: "slides_astronomy"        },
];

exports.handler = async () => {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const database = {};

    for (const { module, table } of MODULES) {
      const rows = await sql(`
        SELECT section, name, link
        FROM ${table}
        ORDER BY sort_order, id
      `);

      database[module] = { title: module, sections: {} };

      for (const row of rows) {
        if (!database[module].sections[row.section]) {
          database[module].sections[row.section] = [];
        }
        database[module].sections[row.section].push({
          name: row.name,
          link: row.link
        });
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(database)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
