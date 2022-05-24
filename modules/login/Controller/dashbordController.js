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

    return res.status(200).json({
        message: found
    })
        
}
 catch (error) {
    return res.status(400).json({
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

    let found = await mysqlcon(sql,[user_id,interval.Start,interval.End]);

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

daily_sale_count_icon: async (req,res)=>{
    let user = req.user;
try {
    let user_id = user.id;
    
    
        let Start = req.body.start_date
        let End = req.body.end_date
    

    let = sql ="SELECT sum(ammount) AS sale ,DATE(created_on) AS time FROM tbl_merchant_transaction WHERE user_id = ? AND DATE(created_on) BETWEEN ? AND ? GROUP by time(created_on)"

    let found = await mysqlcon(sql,[user_id,Start,End]);

    if(!found){
        return res.status(201).json({message: "not found"})
    }
    return res.status(200).json({
        message: found
    })
        
}
 catch (error) {
     console.log(error)
    return res.status(400).json({
        message: "err in finding payout ",error
    })
}
},

dpc_today: async function(req,res){
    let user = req.user;
    let user_id = user.id
    
    var d = new Date();
        let sdate1 = d.toLocaleString().slice(0, 10);
        let today = sdate1.slice(6, 10) + "-" + sdate1.slice(3, 5) + "-" + sdate1.slice(0, 2)
        // week
        var d2 = new Date();
        let sdate2 = d2.toLocaleString().slice(0, 10);
        let start_week = sdate2.slice(6, 10) + "-" + sdate2.slice(3, 5) + "-" + sdate2.slice(0, 2)
        d2.setDate(d.getDate() - 6);
        let s_week_date = d.toLocaleString().slice(0, 10);
        let end_week = s_week_date.slice(6, 10) + "-" + s_week_date.slice(3, 5) + "-" + s_week_date.slice(0, 2)

        // month
        var d3 = new Date();
        let sdate3 = d.toLocaleString().slice(0, 10);
        let start_month = sdate3.slice(6, 10) + "-" + sdate3.slice(3, 5) + "-" + sdate3.slice(0, 2)
        d.setDate(d.getDate() - 29);
        let s_month_date = d3.toLocaleString().slice(0, 10);
        let end_month = s_month_date.slice(6, 10) + "-" + s_month_date.slice(3, 5) + "-" + s_month_date.slice(0, 2)
    

    try{

        let result;

        let one = req.body.one_
        let two = req.body.two_
        let three = req.body.three_

        // for day
        if(one){
            
            sql = "select currency,ammount,ammount_type,settlementAmount,amount from tbl_merchant_transaction inner join tbl_settlement on tbl_merchant_transaction.user_id=tbl_settlement.user_id inner join tbl_icici_payout_transaction_response_details on tbl_settlement.user_id=tbl_icici_payout_transaction_response_details.users_id WHERE DATE(tbl_icici_payout_transaction_response_details.created_on) = ? AND tbl_icici_payout_transaction_response_details.users_id = ?"

            result = await mysqlcon(sql,[today,user_id])

        }

        // week
        if(two){
            
            sql ="select tbl_icici_payout_transaction_response_details.created_on currency,ammount,ammount_type,settlementAmount,amount from tbl_merchant_transaction inner join tbl_settlement on tbl_merchant_transaction.user_id=tbl_settlement.user_id inner join tbl_icici_payout_transaction_response_details on tbl_settlement.user_id=tbl_icici_payout_transaction_response_details.users_id WHERE DATE(tbl_icici_payout_transaction_response_details.created_on) BETWEEN '"+start_week+"' AND '"+end_week+"' AND tbl_icici_payout_transaction_response_details.users_id = ? "

            result = await mysqlcon(sql,user_id)
        }

        // month
        if(three){
                 
            sql = "select tbl_icici_payout_transaction_response_details.created_on currency,ammount,ammount_type,settlementAmount,amount from tbl_merchant_transaction inner join tbl_settlement on tbl_merchant_transaction.user_id=tbl_settlement.user_id inner join tbl_icici_payout_transaction_response_details on tbl_settlement.user_id=tbl_icici_payout_transaction_response_details.users_id WHERE DATE(tbl_icici_payout_transaction_response_details.created_on) BETWEEN '" + start_month + "' AND '" + end_month + "' AND tbl_icici_payout_transaction_response_details.users_id = ?"

            result = await mysqlcon(sql,user_id)
        }

        // console.log(result)

        if(!result){
        return res.status(201).json({ status: false, message: 'Something went wrong, try again later', data: [] });
        }

        return res.status(200).json({ status: true, message: 'data sent successfully', data: result });
        

    }
    catch(Error){
        console.log(Error)
        res.status(500).json({ status: false, message: 'Error to complete task.', Error}); 
    }
    finally{
        console.log("Execution completed.");

    }
},

payment_type: async function (req, res) {
    let user = req.user;
    let user_id = user.id

    try {

        sql ="select payment_type,ammount from tbl_merchant_transaction WHERE user_id = ?";
        
       let result = await mysqlcon(sql,user_id)
            upi_amt = 0;
            wallet_amt = 0;
            card_amt = 0;
            netbanking_amt = 0;
            upi_count=0;
            wallet_count=0;
            card_count=0;
            netbanking_count=0;
            total_count=result.length;

            for(i of result){
                if (i.payment_type === 'CREDIT CARD' || i.payment_type === 'DEBIT CARD'){
                    card_count+=1;
                    card_amt += parseInt(i.ammount);
                }
                else if (i.payment_type==='UPI'){
                    upi_count+=1;
                    upi_amt +=parseInt(i.ammount);
                }
                else if(i.payment_type==='NETBANKING'){
                    netbanking_count+=1;
                    netbanking_amt += parseInt(i.ammount);
                }else{
                    wallet_count+=1;
                    wallet_amt += parseInt(i.ammount);
                }
            }
            upi_percent = Math.round((upi_count / total_count) * 100);
            wallet_percent = Math.round((wallet_count / total_count) * 100);
            card_percent = Math.round((card_count / total_count) * 100);
            netbanking_percent = Math.round((netbanking_count / total_count) * 100);

            let data = { upi: { total: upi_amt, percent: upi_percent }, card: { total: card_amt, percent: card_percent }, wallet: { total: wallet_amt, percent: wallet_percent }, netbanking: { total: netbanking_amt, percent: netbanking_percent } }
        
            res.status(200).json({ status: true, message: 'data sent successfully', data: data });


    }
    catch (Error) {
        res.status(500).json({ status: false, message: 'Error to complete task.', Error });

    }
    finally {
        console.log("Execution completed.");

    }
},

top_transaction_today: async function (req, res) {
    let user = req.user;
    let user_id = user.id
    
    var d = new Date();
        let sdate1 = d.toLocaleString().slice(0, 10);
        let today = sdate1.slice(6, 10) + "-" + sdate1.slice(3, 5) + "-" + sdate1.slice(0, 2)
        // week
        var d2 = new Date();
        let sdate2 = d2.toLocaleString().slice(0, 10);
        let start_week = sdate2.slice(6, 10) + "-" + sdate2.slice(3, 5) + "-" + sdate2.slice(0, 2)
        d2.setDate(d2.getDate() - 6);
        let s_week_date = d2.toLocaleString().slice(0, 10);
        let end_week = s_week_date.slice(6, 10) + "-" + s_week_date.slice(3, 5) + "-" + s_week_date.slice(0, 2)

        // month
        var d3 = new Date();
        let sdate3 = d3.toLocaleString().slice(0, 10);
        let start_month = sdate3.slice(6, 10) + "-" + sdate3.slice(3, 5) + "-" + sdate3.slice(0, 2)
        d.setDate(d3.getDate() - 29);
        let s_month_date = d3.toLocaleString().slice(0, 10);
        let end_month = s_month_date.slice(6, 10) + "-" + s_month_date.slice(3, 5) + "-" + s_month_date.slice(0, 2)
    

    try {
        var request = req.body;

        let result;

        let Day = request.day
        let Week = request.week
        let Month = request.month

        // day
        if(Day){
          
            sql = "select i_flname,payment_type,currency,tbl_merchant_transaction.created_on,ammount,tbl_icici_payout_transaction_response_details.status from tbl_merchant_transaction inner join tbl_icici_payout_transaction_response_details on tbl_merchant_transaction.user_id=tbl_icici_payout_transaction_response_details.users_id WHERE DATE(tbl_merchant_transaction.created_on) = ? AND user_id = ?"

            result = await mysqlcon(sql,[today,user_id]);

        }

        // weeks
        if(Week){
            
            sql = "select i_flname,payment_type,currency,tbl_merchant_transaction.created_on,ammount,tbl_icici_payout_transaction_response_details.status from tbl_merchant_transaction inner join tbl_icici_payout_transaction_response_details on tbl_merchant_transaction.user_id=tbl_icici_payout_transaction_response_details.users_id WHERE DATE(tbl_merchant_transaction.created_on) BETWEEN ? AND ? AND user_id = ?"

            result = await mysqlcon(sql,[start_week,end_week,user_id]);
        }

        //months
        if(Month){
           
            sql = "select i_flname,payment_type,currency,tbl_merchant_transaction.created_on,ammount,tbl_icici_payout_transaction_response_details.status from tbl_merchant_transaction inner join tbl_icici_payout_transaction_response_details on tbl_merchant_transaction.user_id=tbl_icici_payout_transaction_response_details.users_id WHERE DATE(tbl_merchant_transaction.created_on) BETWEEN ? AND ? AND user_id = ?"

            result = await mysqlcon(sql,[start_month,end_month,user_id]);
        }
        
            if(!result){
                return res.status(201).json({ status: false, message: 'Something went wrong, try again later', data: [] });
                }

            return res.status(200).json({ status: true, message: 'data recived successfully', data: result });    
       
    }
    catch (Error) {
        console.log(Error)
        res.status(500).json({ status: false, message: 'Error to complete task.', Error });

    }
    finally {
        console.log("Execution completed.");

    }
},

//
transaction_overview_month: async function (req, res) {
    let user = req.user;
    var d = new Date();
    let sdate = d.toLocaleString().slice(0, 10);
    let onlyyear='2021';//sdate.slice(6,10);
    let start_week = sdate.slice(6, 10) + "-" + sdate.slice(3, 5) + "-" + sdate.slice(0, 2)
    console.log("start week " + start_week);
    d.setDate(d.getDate() - 6);
    let s2date = d.toLocaleString().slice(0, 10);
    let end_week = s2date.slice(6, 10) + "-" + s2date.slice(3, 5) + "-" + s2date.slice(0, 2)
    console.log("end week " + end_week);

    sql ="select sum(ammount) as deposit,date_format(created_on,'%m') as month from tbl_merchant_transaction where date_format(created_on,'%Y')='2021' GROUP BY date_format(created_on,'%m');"
    sql2 ="select sum(amount) as payout,date_format(created_on,'%m') as month from tbl_icici_payout_transaction_response_details where date_format(created_on,'%Y')='2021' GROUP BY date_format(created_on,'%m');"

    try {
        var request = req.body;

        // sql = "select * from  WHERE DATE(created_on) = '2021-01-15'"
        let data = await mysqlcon(sql)
        
        mysqlcon(sql2, (err, resultt) => {
                
                for (let i = 0; i < data.length; i++) {
                    let tt=0;
                    if(tt<resultt.length){
                        data[i]['payout'] = resultt[0].payout
                        tt+=1

                    }else{
                        data[i]['payout'] = ''
                    }
                }
                    console.log("first"+data.length);
                    console.log("second"+resultt.length);

                res.status(200).json({ status: true, message: 'data sent successfully', data: data });

            })
        


    }
    catch (Error) {
        console.log(Error)
        res.status(500).json({ status: false, message: 'Error to complete task.'});

    }
    finally {
        console.log("Execution completed.");

    }
},

transaction_overview_week: async function (req, res) {
    let user = req.user;
    // 0=monday
    sql ="select sum(ammount) as deposit,WEEKDAY(date_format(created_on,'%Y-%m-%d')) as weekday from tbl_merchant_transaction WHERE DATE(created_on) BETWEEN DATE_SUB(date(now()), INTERVAL 6 DAY) AND date(now()) GROUP by date(created_on);"
    sql2 = "select sum(amount) as payout,WEEKDAY(date_format(created_on,'%Y-%m-%d')) as weekday  from tbl_icici_payout_transaction_response_details WHERE DATE(created_on) BETWEEN DATE_SUB(date(now()), INTERVAL 6 DAY) AND date(now()) GROUP by date(created_on)"
    // res.send(users);
    var bconnect = {};
    try {
        var request = req.body;
        // Email=req.email;
        if (request) {
            try {
                // sql = "select * from  WHERE DATE(created_on) = '2021-01-15'"
                mysqlcon.query(sql, (err, result) => {
                    data = result;
                    mysqlcon.query(sql2, (err, resultt) => {
                        for (let i = 0; i < data.length; i++) {
                            let t = 0;
                            if (t < resultt.length) {
                                data[i]['payout'] = resultt[0].payout
                                tt += 1

                            } else {
                                data[i]['payout'] = ''

                            }

                        }
                        res.status(200).json({ status: true, message: 'data sent successfully', data: data });

                    })
                })

            }
            catch (exc) {
                res.status(201).json({ status: false, message: 'Something went wrong, try again later', data: [] });
            }
        }
        else {
            res.status(201).json({ status: false, message: 'All company profile data are required', data: [] });
        }
    }
    catch (e) {
        res.status(500).json({ status: false, message: 'Error to complete task.', data: [] });

    }
    finally {
        console.log("Execution completed.");

    }
},
//
success_rate: async function (req, res) {
    let user = req.user;
    let user_id = user.id

    try {
        
        sql = "select status from  tbl_icici_payout_transaction_response_details WHERE users_id = ?"
        let result = await mysqlcon(sql,user_id);

            let total=result.length;
            let successCount=0;
            for (let i = 0; i < total; i++) {
                if(result[i].status==='SUCCESS'){
                    successCount+=1;
                }
                
            }
            successPercent = Math.round((successCount / total) * 100);
            res.status(200).json({ status: true, message: 'data sent successfully', data: successPercent });
        
            }
    catch (Error) {
        console.log(Error);
        res.status(500).json({ status: false, message: 'Error to complete task.',Error });

    }
    finally {
        console.log("Execution completed.");

    }
},

card_data: async function (req, res) {
    let user = req.user;
    let user_id = user.id

    try{
        
    sql = "select i_flname,date_format(created_on,'%m/%Y') as date,ROUND(sum(ammount)) as deposit,i_email from tbl_merchant_transaction where user_id= ?";

    let result = await mysqlcon(sql,user_id);

    return res.status(200).json({ status: true, message: 'data sent successfully', data: result });
        
    }
    catch (Error) {
        console.log(Error)
        res.status(500).json({ status: false, message: 'Error to complete task.',Error });

    }
    finally {
        console.log("Execution completed.");

    }
},





}




module.exports = dashboardCount;