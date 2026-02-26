const { neon } = require('@neondatabase/serverless');

const GCSE_MODULES = [
  { module: "PHYSICS 101",      tables: ["slides_physics_101"]      },
  { module: "THERMODYNAMICS",   tables: ["slides_thermodynamics"]   },
  { module: "NUCLEAR",          tables: ["slides_nuclear"]          },
  { module: "WAVES",            tables: ["slides_waves"]            },
  { module: "MECHANICS",        tables: ["slides_mechanics"]        },
  { module: "ELECTRICITY",      tables: ["slides_electricity"]      },
  { module: "MAGNETIC EFFECTS", tables: ["slides_magnetic_effects"] },
  { module: "ASTRONOMY",        tables: ["slides_astronomy"]        },
];

const ALEVEL_MODULES = [
  { module: "PHYSICS 101",      tables: ["alevel_physics_101"]                        },
  { module: "THERMODYNAMICS",   tables: ["alevel_thermodynamics"]                     },
  { module: "NUCLEAR",          tables: ["alevel_nuclear"]                            },
  { module: "PARTICLES",        tables: ["alevel_particles"]                          },
  { module: "QUANTUM",          tables: ["alevel_quantum"]                            },
  { module: "WAVES",            tables: ["alevel_waves"]                              },
  { module: "MECHANICS",        tables: ["alevel_mechanics_a", "alevel_mechanics_b"]  },
  { module: "ELECTRICITY",      tables: ["alevel_electricity"]                        },
  { module: "MAGNETIC EFFECTS", tables: ["alevel_magnetic_effects"]                   },
  { module: "MEDICAL IMAGING",  tables: ["alevel_medical_imaging"]                    },
];

async function buildDatabase(sql, moduleList) {
  const database = {};

  for (const { module, tables } of moduleList) {
    database[module] = { title: module, sections: {} };

    for (const table of tables) {
      const rows = await sql(`
        SELECT section, name, link
        FROM ${table}
        ORDER BY sort_order, id
      `);

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
  }

  return database;
}

exports.handler = async (event) => {
  const sql = neon(process.env.DATABASE_URL);
  const level = event.queryStringParameters?.level || 'gcse';

  try {
    const moduleList = level === 'alevel' ? ALEVEL_MODULES : GCSE_MODULES;
    const database = await buildDatabase(sql, moduleList);

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
