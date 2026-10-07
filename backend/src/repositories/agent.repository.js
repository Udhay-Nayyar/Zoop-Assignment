const db = require("../config/db");

const columnByField = Object.freeze({
  fullName: "full_name",
  phone: "phone",
  email: "email",
  serviceArea: "service_area",
  status: "status"
});

const sortColumnByField = Object.freeze({
  createdAt: "created_at",
  updatedAt: "updated_at",
  fullName: "full_name"
});
const orderByValue = Object.freeze({
  asc: "ASC",
  desc: "DESC"
});

function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function mapAgent(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    serviceArea: row.service_area,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function create(data) {
  const result = await db.query(
    `INSERT INTO agents (full_name, phone, email, service_area, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.fullName, data.phone, data.email, data.serviceArea, data.status]
  );
  return mapAgent(result.rows[0]);
}

async function findById(id) {
  const result = await db.query("SELECT * FROM agents WHERE id = $1", [id]);
  return mapAgent(result.rows[0]);
}

async function findAll({ page, limit, status, serviceArea, q, sortBy, order }) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (serviceArea) {
    values.push(escapeLikePattern(serviceArea));
    conditions.push(`service_area ILIKE $${values.length} ESCAPE '\\'`);
  }
  if (q) {
    values.push(`%${escapeLikePattern(q)}%`);
    const parameter = `$${values.length}`;
    conditions.push(
      `(full_name ILIKE ${parameter} ESCAPE '\\' ` +
      `OR email ILIKE ${parameter} ESCAPE '\\' ` +
      `OR phone ILIKE ${parameter} ESCAPE '\\' ` +
      `OR service_area ILIKE ${parameter} ESCAPE '\\')`
    );
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const filterValues = [...values];
  const sortColumn = sortColumnByField[sortBy] || sortColumnByField.createdAt;
  const direction = orderByValue[order] || orderByValue.desc;
  const offset = (page - 1) * limit;
  const itemsValues = [...values, limit, offset];

  const [itemsResult, countResult] = await Promise.all([
    db.query(
      `SELECT * FROM agents ${whereClause}
       ORDER BY ${sortColumn} ${direction}, id ASC
       LIMIT $${itemsValues.length - 1} OFFSET $${itemsValues.length}`,
      itemsValues
    ),
    db.query(
      `SELECT COUNT(*)::int AS total FROM agents ${whereClause}`,
      filterValues
    )
  ]);

  return {
    items: itemsResult.rows.map(mapAgent),
    total: countResult.rows[0].total
  };
}

async function update(id, data) {
  const fields = Object.entries(data)
    .filter(([field]) => Object.hasOwn(columnByField, field));
  if (fields.length === 0) return findById(id);

  const values = fields.map(([, value]) => value);
  const assignments = fields.map(([field], index) =>
    `${columnByField[field]} = $${index + 1}`
  );
  values.push(id);
  const result = await db.query(
    `UPDATE agents SET ${assignments.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return mapAgent(result.rows[0]);
}

async function remove(id) {
  const result = await db.query("DELETE FROM agents WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  create,
  findById,
  findAll,
  update,
  remove
};
