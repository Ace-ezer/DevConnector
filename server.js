const express = require('express') ;
const connectDB = require('./config/db');

const app = express() ;

//Connection to database
connectDB();

//Init Middleware
app.use(express.json({ extended : false }));

app.get('/' , ( req , res ) => {
    res.send('Hello!') ;
});

//Routes
const users = require('./routes/api/users');
app.use( '/api/users' , users ) ;

const auth = require('./routes/api/auth');
app.use( '/api/auth' , auth ) ;

const profile = require('./routes/api/profile');
app.use( '/api/profile' , profile ) ;

const posts = require('./routes/api/posts');
app.use( '/api/posts' , posts );


// Server Connection
const PORT = process.env.PORT || 5000 ;

app.listen( PORT , () => console.log("Server Running..") );
