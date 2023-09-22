const pg = require ('pg');
const client = new pg.Client('postgress://localhost/morgans_db');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/cowboys', async(req,res,next)=>{
    try {
        const SQL = `
        SELECT *
        FROM cowboys
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/api/cowboys/:id', async(req,res,next)=>{
    try {
        const SQL = `
        SELECT *
        FROM cowboys
        WHERE id = $1
        `;
        const response = await client.query(SQL,[req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
        
    }
});
app.delete('/api/cowboys/:id', async(req,res,next)=>{
    try{
        const  SQL =`
            DELETE FROM cowboys WHERE id =$1
            `;
            const response = await client.query(SQL,[req.params.id]);
            res.send(response.rows[0]);  
    }catch(error){
        next(error);
    }
})
app.post('/api/cowboys', async(req,res,next)=>{
    const body = req.body;
    try {
        const SQL = `
        INSERT INTO cowboys (name, position, number) VALUES ($1, $2, $3)
        RETURNING *
        `;
        const response = await client.query(SQL, [ body.name, body.position, body.number]);
        res.send(response.rows);
        
    } catch (error) {
        next(error);
    }
});

app.put('/api/cowboys/:id', async(req,res,next)=>{
    try {
        const SQL= `
        UPDATE cowboys
        SET name = $1, position = $2, number = $3
        WHERE id = $4
        RETURNING *
        `;
        const response = await client.querey(SQL,[req.body.name, req.body.position, req.body.number, req.params.id]);
        req.send(response.rows);
    } catch (error) {
        next(error);
        
    }
});

app.use('*',(req,res,next)=>{
    res.status(404).send('Invalid provoke');
});

app.use((err,req,res,next)=>{
    res.status(500).send(err.message);
});


const start = async ()=>{
    await client.connect();
    console.log('connected to client');
    
    const port = process.env.PORT || 3000;
    
    const SQL = `
    DROP TABLE IF EXISTS cowboys;
    CREATE TABLE cowboys(
        id SERIAL PRIMARY KEY,
        name VARCHAR (100),
        position VARCHAR (100),
        number INT
        );
        INSERT INTO cowboys (name, position, number) VALUES ('Tony Pollard','RB','20');
        INSERT INTO cowboys (name, position, number) VALUES ('CeeDee Lamb', 'WR', '88');
        INSERT INTO cowboys (name, position, number) VALUES ('Micah Parsons', 'LB', '11');
        `;

    await client.query(SQL);
    app.listen(port, ()=>{
        console.log(`the app is listening to ${port}`);
    });




};
start()