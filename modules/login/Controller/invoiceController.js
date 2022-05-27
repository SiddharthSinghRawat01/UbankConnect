const mysqlcon = require('../../../config/db_connection');
const dateTime = require('node-datetime');
const Date = dateTime.create();
const date_format = Date.format('ymd');

const Invoice = {

 
allInvoice: async (req,res)=>{

    let user = req.user
    let user_id = user.id
    let { from,to } = req.body
    
    console.log(from+" to "+ to )

    let pagination = (total,page)=>{
        let limit = 15;
        let numOfPages = Math.ceil(total / limit)
        let start = ((page * limit) - (limit))
        return {limit,start,numOfPages}
    }

    try {

        let sql1 = 'SELECT * FROM tbl_user_invoice WHERE merchant_id = ? ORDER BY id ASC';
        let result =  await mysqlcon(sql1,user_id)

        // console.log(result[0].requestedAmount) ICONS
        // let requestedAmount = result[0].request;
        // let charges = result[0].charges
        // let settlementAmount = result[0].amount
        console.log(result)
       
        // // paginenation
        // let total = result[0].count
        // let Page = req.body.page ? Number(req.body.page) : 1
        // let page = await pagination(total,Page);

        // console.log("total"+total)
        // console.log(page)
        // // console.log(result)

        // let data
        // if(from == undefined && to == undefined){
        //     let sql = 'SELECT * FROM tbl_settlement WHERE user_id = ? AND DATE(created_on) = DATE(NOW()) LIMIT ?,? ORDER BY id ASC';
        //     data = await mysqlcon(sql,[user_id,page.start,page.limit]);
        // }else{
        //     let sql = 'SELECT * FROM tbl_settlement WHERE user_id = ? AND DATE(created_on) >= ? AND DATE(created_on) <= ? LIMIT ?,? ORDER BY id ASC';
        //     data = await mysqlcon(sql,[user_id,from,to,page.start,page.limit]);
        // }
        
        // console.log(data)

        return res.json(200,{
            message: "settelment transaston",
            allinvoice: result
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