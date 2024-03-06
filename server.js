const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_employees_departements_db')
const app = express()
const port = process.env.PORT || 8000
app.use(express.json())
app.use(require('morgan')('dev'))
// ... your routes go next

app.get('/api/departments', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from departments
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
      const response = await client.query(SQL, [req.body.name, req.body.category_id])
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
        req.body.name,
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



const init = async () => {
    await client.connect();
    console.log('connected to database')
    let SQL = `DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments CASCADE;
    CREATE TABLE departments(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE employees(
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      
      name VARCHAR(255) NOT NULL,
      department_id INTEGER REFERENCES departments(id) NOT NULL
    );`
    await client.query(SQL)
    console.log('tables created')
    SQL = `INSERT INTO departments(name) VALUES('HR');
    INSERT INTO departments(name) VALUES('OUTBOUND');
    INSERT INTO departments(name) VALUES('INBOUND');
    INSERT INTO employees(name, department_id) VALUES('add logging middleware', (SELECT id FROM departments WHERE name='HR'));
    INSERT INTO employees(name, department_id) VALUES('John Doe', (SELECT id FROM departments WHERE name='OUTBOUND'));
    INSERT INTO employees(name, department_id) VALUES('Jane Smith', (SELECT id FROM departments WHERE name='OUTBOUND'));
    INSERT INTO employees(name, department_id) VALUES('Alice Johnson', (SELECT id FROM departments WHERE name='HR'));
    INSERT INTO employees(name, department_id) VALUES('Bob Brown', (SELECT id FROM departments WHERE name='INBOUND'))`;
    await client.query(SQL)
    app.listen(port, () => console.log(`listening on port ${port}`))

}
init()