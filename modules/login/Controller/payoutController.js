const mysqlcon = require('../../../config/db_connection');

let pagination = (total,page)=>{
    let limit = 10;

    let numOfPages = Math.ceil(total / limit)
    let start = ((page * limit) - (limit))

    return {limit,start,numOfPages}
}

const payoutMethods = {
searchByOrderId: async (req, res) => {
    let user = req.user;
    try {
        const { uniqueid } = req.body;
        let sql = 'SELECT * FROM tbl_icici_payout_transaction_response_details WHERE users_id = ? AND uniqueid LIKE ?';
        let result = await mysqlcon(sql, [user.id,`%${uniqueid}%`]);
        console.log(`%${uniqueid}%`)
        
            if (result.length === 0) {
                res.status(201).json({ message: 'No record found.' });
            } else {
                res.status(200).json({
                    message: 'Report for order id ' + uniqueid + ' is ',
                    data: result
                })
            }
        
    } catch (error) {
        console.log(error)
        res.status(201).json({ status: false, message: 'Some error occured'});
    } finally {
        console.log("Execution completed.");
    }
},

Date: async (req, res) => {
    let user = req.user;
    
    try {
        const { todaysDate } = req.body;
        let sql = 'SELECT COUNT(*) AS Total FROM tbl_icici_payout_transaction_response_details WHERE DATE(created_on) = ? AND users_id = ?';
        mysqlcon(sql, [todaysDate, user.id], async (err, result) => {
            console.log(result)
            let total = result[0].Total
            let Page = req.body.page ? Number(req.body.page) : 1

            let page = pagination(total,Page);
            // console.log(page.limit,page.start)

            let sql1 = 'SELECT * FROM tbl_icici_payout_transaction_response_details WHERE DATE(created_on) = ? AND users_id = ? LIMIT ?,?'
            mysqlcon(sql1, [todaysDate, user.id, page.start, page.limit], async (err, result) => {
                if (result.length === 0) {
                    res.status(201).json({ message: 'No record found.' });
                } else {
                    res.status(200).json({
                        message: 'Report for Date ' + todaysDate + ' is ',
                        currPage: page,
                        message1: 'Showing ' + result.length + ' out of ' + total + ' results',
                        totalPage: page.numOfPages,
                        data: result
                    })
                }
            })
        })
    } catch (error) {
        res.status(201).json({ status: false, message: 'Some error occured', data: [] });
    } finally {
        console.log("Execution completed.");
    }
},


customDate: async (req, res) => {
        let user = req.user;
        const { from, to } = req.body;
        let limit = 10;
        try {
            let sql = 'SELECT COUNT(*) AS Total FROM tbl_icici_payout_transaction_response_details WHERE DATE(created_on) >= ? AND DATE(created_on) <= ? AND users_id = ?'
            let data = await mysqlcon(sql, [from, to, user.id])
                let total = data[0].Total
                let Page = req.body.page ? Number(req.body.page) : 1

                let page = pagination(total,Page);
               

                let sql1 = 'SELECT * FROM tbl_icici_payout_transaction_response_details WHERE DATE(created_on) >= ? AND DATE(created_on) <= ? AND users_id = ? LIMIT ?,?'
                let result = await mysqlcon(sql1, [from, to, user.id, page.start, page.limit])

                    if (result.length === 0) {
                        res.status(201).json({ message: 'No record found.' });
                    } else {
                        res.status(200).json({
                            message: 'Report from ' + from + " to " + to + ' is ',
                            currPage: Page,
                            message1: 'Showing ' + limit + ' out of ' + total + ' results',
                            totalPage: page.numOfPages,
                            data: result
                        })
                    }
                
        } catch (error) {
            res.status(201).json({ status: false, message: 'Some error occured', data: [] });
        } finally {
            console.log("Execution completed.");
        }
    },

success: async (req, res) => {
    let user = req.user;
    try {
        
        let SQL = 'SELECT count(status) as count FROM tbl_icici_payout_transaction_response_details WHERE  users_id = ?'
        let total_no_transction = await mysqlcon(SQL, [user.id]);
        
        let total = total_no_transction[0].count
        console.log(total_no_transction[0].count)

            // console.log(total_no_transction.length)

        let sql = 'SELECT  count(status) AS count,SUM(amount) AS amount FROM tbl_icici_payout_transaction_response_details WHERE  users_id = ? AND status = ?';
        let result = await mysqlcon(sql, [user.id, 'SUCCESS']);
        
            if (result.length === 0) {
                return res.status(201).json({
                    message: 'Total Success amount of ' + user.name + ' is 0.',
                    data: 0
                });
            }
            
            let percent = (result[0].count/total * 100)
            return res.status(200).json({
                message: 'Total Success amount of ' + user.name + ' is ' + result[0].amount,
                data: percent ,
                "total transction" : total,
                sucess: result[0].count
            })
            
        
    } catch (error) {
        console.log(error)
        res.status(201).json({ status: false, message: 'Some error occured', data: [] });
    } finally {
        console.log("Execution completed.");
    }
},


declined: async (req, res) => {
    let user = req.user;
    try {
        
        let SQL = 'SELECT count(status) as count FROM tbl_icici_payout_transaction_response_details WHERE  users_id = ?'
        let total_no_transction = await mysqlcon(SQL, [user.id]);
        
        let total = total_no_transction[0].count
        console.log(total_no_transction[0].count)

            // console.log(total_no_transction.length)

        let sql = 'SELECT  count(status) AS count,SUM(amount) AS amount FROM tbl_icici_payout_transaction_response_details WHERE  users_id = ? AND status = ?';
        let result = await mysqlcon(sql, [user.id, 'FAILURE']);
        
            if (result.length === 0) {
                return res.status(201).json({
                    message: 'Total failuer amount of ' + user.name + ' is 0.',
                    data: 0
                });
            }
            
            let percent = (result[0].count/total * 100)
            return res.status(200).json({
                message: 'Total failuer amount of ' + user.name + ' is ' + result[0].amount,
                data: percent ,
                "total transction" : total,
                sucess: result[0].count
            })
            
        
    } catch (error) {
        console.log(error)
        res.status(201).json({ status: false, message: 'Some error occured', data: [] });
    } finally {
        console.log("Execution completed.");
    }
},

pending: async (req, res) => {
    let user = req.user;
    try {
        
        let SQL = 'SELECT count(status) as count FROM tbl_icici_payout_transaction_response_details WHERE  users_id = ?'
        let total_no_transction = await mysqlcon(SQL, [user.id]);
        
        let total = total_no_transction[0].count
        console.log(total_no_transction[0].count)

            // console.log(total_no_transction.length)

        let sql = 'SELECT  count(status) AS count,SUM(amount) AS amount FROM tbl_icici_payout_transaction_response_details WHERE  users_id = ? AND status = ?';
        let result = await mysqlcon(sql, [user.id, 'PENDING']);
        
            if (result.length === 0) {
                return res.status(201).json({
                    message: 'Total failuer amount of ' + user.name + ' is 0.',
                    data: 0
                });
            }
            
            let percent = (result[0].count/total * 100)
            return res.status(200).json({
                message: 'Total failuer amount of ' + user.name + ' is ' + result[0].amount,
                data: percent ,
                "total transction" : total,
                sucess: result[0].count
            })
            
        
    } catch (error) {
        console.log(error)
        res.status(201).json({ status: false, message: 'Some error occured', data: [] });
    } finally {
        console.log("Execution completed.");
    }
},

// shyam
total: async (req, res) => {
    let user = req.user;
    res.status(200).json({
        message: 'Total amount of ' + user.name + ' is ' + user.wallet,
        data: user.wallet
    });
},

viewDetails: async (req, res) => {
    let user = req.user;
    const { uniqueid } = req.body;
    try {
        let sql = 'SELECT * FROM tbl_icici_payout_transaction_response_details WHERE uniqueid = ? AND users_id = ?';
        let result = await mysqlcon(sql, [uniqueid, user.id])
            res.status(200).json({
                message: 'Transection details are : ',
                data: result
            })
    
    } catch (error) {
        res.status(201).json({ status: false, message: 'Some error occured', data: [] });
    } finally {
        console.log("Execution completed.");
    }
},

downloadReport: async (req, res) => {
    let user = req.user;
    const { uniqueid } = req.body
    try {
        if (uniqueid != undefined) {
            let sql = 'SELECT uniqueid, created_on, utrnumber, creditacc, bank_name, amount, status FROM tbl_icici_payout_transaction_response_details WHERE uniqueid in (?) AND users_id = ?';
            let result = await mysqlcon(sql, [uniqueid, user.id]);
                if (result.length === 0) {
                    res.status(201).json({ message: 'No record found.' });
                } else {
                    res.status(200).json({
                        message: 'Transection details are : ',
                        data: result
                    })
                }
            
        }
        else {
            let sql = 'SELECT uniqueid, created_on, utrnumber, creditacc, bank_name, amount, status FROM tbl_icici_payout_transaction_response_details WHERE users_id = ?';
            let result = await mysqlcon(sql, [user.id])
                if (result.length === 0) {
                    res.status(201).json({ message: 'No record found.' });
                } else {
                    res.status(200).json({
                        message: 'Transection details are : ',
                        data: result
                    })
                }
            
        }
    } catch (error) {
        res.status(201).json({ status: false, message: 'Some error occured', data: [] });
    } finally {
        console.log("Execution completed.");
    }

}

}



module.exports = payoutMethods

