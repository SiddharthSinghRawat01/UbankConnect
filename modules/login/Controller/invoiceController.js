const mysqlcon = require('../../../config/db_connection');
const dateTime = require('node-datetime');
const Date = dateTime.create();
const date_format = Date.format('d/m/y');

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
        let sql1 = 'SELECT invoice_no,send_date,due_date,email,amount,tax_amount,pay_status FROM tbl_user_invoice where merchant_id = ?'
        
        let data = await mysqlcon(sql1,merchant_id);

        //


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
    }

}

}

module.exports = Invoice