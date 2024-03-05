const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_employees_departements_db')
const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(require('morgan')('dev'))
// ... your routes go next

app.get('/api/departments', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from department
      `
      const response = await client.query(SQL)
      res.send(response.rows)
    } catch (ex) {
      next(ex)
    }
  })
  
  app.get('/api/employees', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from employees ORDER BY created_at DESC;
      `
      const response = await client.query(SQL)
      res.send(response.rows)
    } catch (ex) {
      next(ex)
    }
  })
  
  app.post('/api/employees', async (req, res, next) => {
    try {
      const SQL = `
        INSERT INTO employees(name, department_id)
        VALUES($1, $2)
        RETURNING *
      `
      const response = await client.query(SQL, [req.body.txt, req.body.category_id])
      res.send(response.rows[0])
    } catch (ex) {
      next(ex)
    }
  })
  
  app.put('/api/employees/:id', async (req, res, next) => {
    try {
      const SQL = `
        UPDATE employees
        SET name=$1, ranking=$2, department_id=$3, updated_at= now()
        WHERE id=$4 RETURNING *
      `
      const response = await client.query(SQL, [
        req.body.nmae,
        req.body.ranking,
        req.body.department_id,
        req.params.id
      ])
      res.send(response.rows[0])
    } catch (ex) {
      next(ex)
    }
  })
  
  app.delete('/api/employees/:id', async (req, res, next) => {
    try {
      const SQL = `
        DELETE from employees
        WHERE id = $1
      `
      const response = await client.query(SQL, [req.params.id])
      res.sendStatus(204)
    } catch (ex) {
      next(ex)
    }
  });
// ... next, inside your init function
app.listen(port, () => console.log(`listening on port ${port}`))


const init = async () => {
    await client.connect();
    console.log('connected to database')
    let SQL = `DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departements(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE notes(
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      departement_id INTEGER DEFAULT 3 NOT NULL,
      name VARCHAR(255) NOT NULL,
      departement_id INTEGER REFERENCES departments(id) NOT NULL
    );`
    await client.query(SQL)
    console.log('tables created')
    SQL = `INSERT INTO categories(name) VALUES('SQL');
    INSERT INTO categories(name) VALUES('Express');
    INSERT INTO categories(name) VALUES('Shopping');
    INSERT INTO employees(name, ranking, department_id) VALUES('ALI', 5, (SELECT id FROM departments WHERE name='Ali'));
    INSERT INTO employees(name, ranking, department_id) VALUES('add logging middleware', 5, (SELECT id FROM categories WHERE name='Ali'));
    INSERT INTO employees((name, ranking, department_id) VALUES('write SQL queries', 4, (SELECT id FROM departments WHERE name='NANCY'));
    INSERT INTO employees((name, ranking, department_id) VALUES('learn about foreign keys', 4, (SELECT id FROM departments WHERE name='NANCY'));
    INSERT INTO employees((name, ranking, department_id) VALUES('buy a quart of milk', 2, (SELECT id FROM departments WHERE name='BOB'));`
}