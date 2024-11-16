const transactionService = require('./TransactionService');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = 8080;

// CORS configuration
const corsOptions = {
    origin: 'https://your-s3-website-url.com',  // Allow only your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Allow cookies or credentials, if required
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

// Routes
app.get('/health', (req, res) => {
    res.json("This is the health check");
});

app.post('/transaction', (req, res) => {
    try {
        let t = moment().unix();
        console.log("{ \"timestamp\" : %d, \"msg\" : \"Adding Expense\", \"amount\" : %d, \"Description\": \"%s\" }", t, req.body.amount, req.body.desc);
        let success = transactionService.addTransaction(req.body.amount, req.body.desc);
        if (success === 200) res.json({ message: 'Added transaction successfully' });
    } catch (err) {
        res.json({ message: 'Something went wrong', error: err.message });
    }
});

app.get('/transaction', (req, res) => {
    try {
        let transactionList = [];
        transactionService.getAllTransactions(function (results) {
            results.forEach(row => {
                transactionList.push({ "id": row.id, "amount": row.amount, "description": row.description });
            });
            let t = moment().unix();
            console.log("{ \"timestamp\" : %d, \"msg\" : \"Getting All Expenses\" }", t);
            res.status(200).json({ "result": transactionList });
        });
    } catch (err) {
        res.json({ message: "Could not get all transactions", error: err.message });
    }
});

app.delete('/transaction', (req, res) => {
    try {
        transactionService.deleteAllTransactions(function (result) {
            let t = moment().unix();
            console.log("{ \"timestamp\" : %d, \"msg\" : \"Deleted All Expenses\" }", t);
            res.status(200).json({ message: "Delete function execution finished." });
        });
    } catch (err) {
        res.json({ message: "Deleting all transactions may have failed.", error: err.message });
    }
});

app.delete('/transaction/id', (req, res) => {
    try {
        transactionService.deleteTransactionById(req.body.id, function (result) {
            res.status(200).json({ message: `Transaction with ID ${req.body.id} deleted` });
        });
    } catch (err) {
        res.json({ message: "Error deleting transaction", error: err.message });
    }
});

app.get('/transaction/id', (req, res) => {
    try {
        transactionService.findTransactionById(req.body.id, function (result) {
            let id = result[0].id;
            let amt = result[0].amount;
            let desc = result[0].desc;
            res.status(200).json({ "id": id, "amount": amt, "desc": desc });
        });
    } catch (err) {
        res.json({ message: "Error retrieving transaction", error: err.message });
    }
});

app.listen(port, () => {
    let t = moment().unix();
    console.log("{ \"timestamp\" : %d, \"msg\" : \"App Started on Port %s\" }", t, port);
});
