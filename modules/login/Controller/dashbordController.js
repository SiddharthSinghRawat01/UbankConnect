const config = require("../../../config/config");
const mysqlcon = require('../../../config/db_connection');
var dateTime = require('node-datetime');
var dt = dateTime.create();
var formatted_date_time = dt.format('YYYY-MM-DDTHH:mm:ss.sssZ');
let formatted_date = formatted_date_time.slice(0,11);
console.log(formatted_date);


const dashboardCount ={
    
deposits_icon: async (req,res)=>{
    let user = req.user;
try {
    let user_id = user.id;
    let interval = {
        Start : req.body.starttime,
        End : req.body.endtime
    }

    let = sql ="select sum(ammount) as deposit ,time(created_on) as time from tbl_merchant_transaction WHERE user_id = ? AND TIME(created_on) BETWEEN ? AND ? and date(created_on)= date(now()) GROUP by time(created_on);"

    let found = await mysqlcon(sql,[user_id],[interval]);

    return res.json({
        status: 200,
        message: found
    })
        
}
 catch (error) {
    return res.json({
        status: 400,
        message: "err in finding payout ",error
    })
}
},

payout_icon:async (req,res)=>{
    let user = req.user;
try {
    let user_id = user.id;
    let interval = {
        Start : req.body.starttime,
        End : req.body.endtime
    }

    let = sql ="select sum(amount) as payout ,time(created_on) as time from tbl_icici_payout_transaction_response_details WHERE user_id = ? AND TIME(created_on) BETWEEN ? AND ? and date(created_on)= date(now()) GROUP by time(created_on);"

    let found = await mysqlcon(sql,[user_id],[interval]);

    return res.json({
        status: 200,
        message: found
    })
        
}
 catch (error) {
    return res.json({
        status: 400,
        message: "err in finding payout ",error
    })
}
}



}




module.exports = dashboardCount;