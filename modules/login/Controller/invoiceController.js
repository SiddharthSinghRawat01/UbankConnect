const mysqlcon = require('../../../config/db_connection');
const dateTime = require('node-datetime');
const { localsName } = require('ejs');
const Date = dateTime.create();
const date_format = Date.format('dmy');

const Invoice = {

 
allInvoice: async (req,res)=>{

    let user = req.user
    let merchant_id = user.id
    // let { from,to } = req.body
    
    // console.log(from+" to "+ to )

    let pagination = (total,page)=>{
        let limit = 15;
        let numOfPages = Math.ceil(total / limit)
        let start = ((page * limit) - (limit))
        return {limit,start,numOfPages}
    }

    try {
            
        //icon
        let sql = 'SELECT count(*) as all_invoice,(SELECT sum(amount) FROM tbl_user_invoice WHERE merchant_id = ? AND pay_status = 1) as paid_ammount, (SELECT sum(amount) FROM tbl_user_invoice WHERE merchant_id = ? AND pay_status = 0) as unpaid_amount,(SELECT sum(amount) FROM tbl_user_invoice WHERE merchant_id = ? AND pay_status = 0 AND date(due_date) < date(now()) ) as due_amount FROM tbl_user_invoice WHERE merchant_id = ?';

        let icon =  await mysqlcon(sql,[merchant_id,merchant_id,merchant_id,merchant_id]);

        //page
        pagination(icon[0].all_invoice,req.body.page);

        //data
        let sql1 = 'SELECT invoice_no,send_date,due_date,email,amount,tax_amount,pay_status,created_on FROM tbl_user_invoice where merchant_id = ? '


        // today
        if(req.body.date === '1'){
            console.log('1')
            sql1 += 'AND DATE(created_on) = date(now())'
        }
        // yesterday
        if(req.body.date === '2'){
            console.log('2')
            sql1 += 'AND DATE(created_on) = date_sub(date(now()),interval 1 day)'
        }
        // in between period
        if(req.body.from && req.body.to){
            console.log('3')
            sql1 += 'AND DATE(created_on) >= "'+req.body.from+'" AND DATE(created_on) <= "'+req.body.to+'"'
        }

        //filter
 
         if(req.body.paid === '1' && req.body.unpaid !== '1' &&req.body.due !== '1'){
            console.log('1')
             sql1 += ' AND pay_status = 1'
             console.log(sql1)
         }
         if(req.body.paid !== '1' && req.body.unpaid === '1' &&req.body.due !== '1'){
            console.log('2')
            sql1 += ' AND pay_status = 0'
            console.log(sql1)
        }

        if(req.body.paid === '1' && req.body.unpaid === '1' &&req.body.due !== '1'){
            console.log('2')
            sql1 
            console.log(sql1)
        }

        if(req.body.paid !== '1' && req.body.unpaid !== '1' &&req.body.due === '1'){
            console.log('3')
            sql1 += ' AND  DATE(due_date) < DATE(now())'
            console.log(sql1)
        }

        if(req.body.paid === '1' && req.body.unpaid !== '1' &&req.body.due === '1'){
            console.log('3')
            sql1 += ' AND  DATE(due_date) < DATE(now()) AND pay_status = 1'
            console.log(sql1)
        }

        if(req.body.paid !== '1' && req.body.unpaid === '1' &&req.body.due === '1'){
            console.log('3')
            sql1 += ' AND  DATE(due_date) < DATE(now()) AND pay_status = 0'
            console.log(sql1)
        }

        if(req.body.paid === '1' && req.body.unpaid === '1' &&req.body.due === '1'){
            console.log('3')
            sql1
            console.log(sql1)
        }

    
        let data = await mysqlcon(sql1,merchant_id);

        

        return res.json(200,{
            message: "settelment transaston",
            allinvoice: icon,
            data: data
        })
        
    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occure",
            error
        });
    }finally{
        console.log("Execution completed.");
    }

},

new_invoice: async (req,res)=>{
    let user = req.user
    let request = req.body
    console.log(Date._now)
    let new_invoice

    try {
       if(!request.taxable){ 
       new_invoice = {
           merchant_id: user.id,
           invoice_no: request.invoice_no,
           send_date: request.send_date,
           due_date: request.due_date,
           fname: request.fname,
           lname: request.lname,
           email: request.email,
           amount: request.amount,
           currency: request.currency,
           description: request.description
       }
    } else {
        new_invoice = {
            merchant_id: user.id,
            invoice_no: request.invoice_no,
            send_date: request.send_date,
            due_date: request.due_date,
            fname: request.fname,
            lname: request.lname,
            email: request.email,
            amount: request.amount,
            currency: request.currency,
            tax_amount: (request.amount * request.tax_amount)/ 100,
            description: request.description
        }
       }

       let sql= 'INSERT INTO tbl_user_invoice SET ?'

       let inserted = await mysqlcon(sql,[new_invoice]);

       return res.status(200).json({
           inserted
       })


    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occure",
            error
        });
    }finally{
        console.log("Execution completed.");
    }

}

}

module.exports = Invoice