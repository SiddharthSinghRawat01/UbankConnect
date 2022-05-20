const query = require('../config/mysql');

const ObjectsToCsv = require('objects-to-csv');


function paginated(result,page){

    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {}

    if (endIndex < result.length) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

    results.current = result.slice(startIndex,endIndex);

    return results;

}

module.exports.show = async function(req,res){

    // when login is done by from user than after we will search in merchant transaction table
    try {
        let sql ="SELECT order_no,user_id,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction  where user_id = 15 ORDER BY TIME(created_on) DESC";

        let result = await query(sql)
        // console.log(result);
        
        let page = req.body.page ? parseInt(req.body.page) : 1

        let output = await paginated(result,page);

        
        return res.json(200, {
            message: `All Deposits Transactions are ${result.length}`,
    
            data: {
                deposits:output
            }

        });

    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occurered",
            error: error
        })
    }


}

module.exports.searchByOrder = async function(req,res){


    try {

        let {orderNumber} = req.body;

        let sql = "SELECT order_no,updated_on,i_flname,ammount,settle_amount,status FROM tbl_merchant_transaction WHERE order_no LIKE ?";

        let result = await query(sql,[orderNumber+"%"]);

        return res.json(200, {
            message: 'Deposit by order id Transactions',
            data: {
                deposits:result
            }

        });
        
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occurered",
            error: error
        })
        
    }

    

}

module.exports.searchByDate = async function(req,res){

    try {

        let {date} = req.body;

        let sql = "SELECT order_no,updated_on,i_flname,ammount,settle_amount,status FROM tbl_merchant_transaction WHERE DATE(updated_on) = '"+date+"'";

        let result  = await query(sql);
        
        let page = req.body.page ? parseInt(req.body.page) : 1

        let output = await paginated(result,page);

        return res.json(200, {
            message: `${result.length} Deposit Transactions for Date ${date}`,
            data: {
                deposits:output
            }

        });
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occurered",
            error: error
        })
        
    }
  

}

module.exports.searchByDateRange = async function(req,res){

    try {

        let {from,to} = req.body;

        let result = await query("SELECT order_no,updated_on,i_flname,ammount,settle_amount,status FROM tbl_merchant_transaction WHERE DATE_(updated_on) between '"+from+"' AND '"+to+"' "); 
       
        let page = req.body.page ? parseInt(req.body.page) : 1

        let output = await paginated(result,page);

        return res.json(200, {
            message: `${result.length} Deposit Transactions for Date from ${from} to ${to}`,
            data: {
                deposits:output
            }

        });
   
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occured",
            error: error
        })
        
    }

    

}

module.exports.convertToCsv = async function(req,res){

    let result = await query("SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction");
           
    const csv = new ObjectsToCsv(result);
        // Save to file:
         await csv.toDisk('./test.csv');
        // console.log(await csv.toString());
       return res.download("./test.csv");

}

module.exports.filterRecord = async function(req,res){

    try {


        if(req.body.methodPayment === undefined && req.body.status === undefined && req.body.currency === undefined){
            //    return res.redirect('/deposits/show_all');
        
                let sql1 ="SELECT order_no,user_id,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction where user_id = 15";
        
                let result = await query(sql1);

                console.log(result);

                let page = req.body.page ? parseInt(req.body.page) : 1

                let output = await paginated(result,page); 

                return res.json(200, {
                    message: `All Deposits Transactions are ${result.length}`,

                    data: {
                        deposits:output
                    }

                });      
        
            }


        
            let sql;
            
            if(req.body.methodPayment !== undefined){
        
                console.log(req.body.methodPayment.length);
        
        
                if(typeof(req.body.methodPayment) === 'string'){
                    sql="";
                    sql+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE ";
                    sql+="payment_type = ";
                    sql+="'";
                    sql+=req.body.methodPayment;
                    sql+="'";
                }else{
                    sql="";
                    sql+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE ";
                    sql+="payment_type IN (";
                    for(let i=0; i<req.body.methodPayment.length; i++){
                        sql+="'"
                        sql+=req.body.methodPayment[i];
                        sql+="'"
                        sql+=',';
                    }
                    sql = sql.slice(0,-1);
                    sql+=")";
                }
        
              
            }
            
        
            if(req.body.status !== undefined){
        
                if(typeof(req.body.status) === 'string'){
        
                    if(sql !== undefined){
                        sql+= " AND ";
                        sql+= "status = ";
                        sql+=req.body.status;
                    
                    }else{
                        sql="";
                        sql+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE ";
                        sql+="status = ";
                        sql+=req.body.status; 
                        
                    }
                }else{
        
                    if(sql !== undefined){
                        sql+= " AND ";
                        sql+= "status IN (";
                        for(let i=0; i<req.body.status.length; i++){
        
                            sql+="'";
                            sql+=req.body.status[i];
                            sql+="'"
                            sql+=',';
                        }
                        sql=sql.slice(0,-1);
                        sql+=")"
                       
                    }else{
                        sql="";
                        sql+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE ";
                        sql+= "status IN (";
                        for(let i=0; i<req.body.status.length; i++){
        
                            sql+="'";
                            sql+=req.body.status[i];
                            sql+="'"
                            sql+=',';
                        }
                        sql=sql.slice(0,-1);
                        sql+=")"
        
                    }
        
                    }
        
        
            }
        
        
            if(req.body.currency !== undefined){
        
        
                if(typeof(req.body.currency) === 'string'){
        
                    if(sql !== undefined){
                        sql+= " AND ";
                        sql+= "ammount_type = ";
                        sql+="'";
                        sql+=req.body.currency;
                        sql+="'";
                    
                    }else{
                        sql="";
                        sql+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE ";
                        sql+="ammount_type = ";
                        sql+="'";
                        sql+=req.body.currency; 
                        sql+="'";
                        
                    }
                }else{
        
                    if(sql !== undefined){
                        sql+= " AND ";
                        sql+= "ammount_type IN (";
                        for(let i=0; i<req.body.currency.length; i++){
        
                            sql+="'";
                            sql+=req.body.currency[i];
                            sql+="'"
                            sql+=',';
                        }
                        sql=sql.slice(0,-1);
                        sql+=")"
                       
                    }else{
                        sql="";
                        sql+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE ";
                        sql+= "ammount_type IN (";
                        for(let i=0; i<req.body.currency.length; i++){
        
                            sql+="'";
                            sql+=req.body.currency[i];
                            sql+="'"
                            sql+=',';
                        }
                        sql=sql.slice(0,-1);
                        sql+=")"
        
                    }
        
                    }
        
        
            }
        
            let result =  await query(sql); 

            let page = parseInt(req.body.page);

            let output = await paginated(result,page);

            return res.json(200,{
                message: "take sql",
                sql : sql,
                data: output
            })
             

        
    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occured",
            error: error
        })
       
    }

}

module.exports.success = async function(req,res){

    try {

        let sql = "SELECT COUNT(*) as total FROM tbl_merchant_transaction";

        let result =await query(sql);
        

        let totalCount = result[0].total;

        let sql1 = "SELECT COUNT(*) as total FROM tbl_merchant_transaction WHERE status=1";

        let statusResult = await query(sql1);

            let successCount = statusResult[0].total;

            let percentage = (successCount/totalCount)*100;

            percentage = await Math.round(percentage);

            return res.json(200,{
                message:`${percentage}% Success`,
                data: {
                    percentage
                }
            })

        
    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occured",
            error: error
        })
        
    }

    

    
} 

module.exports.declined = async function(req,res){


    try {

        let sql = "SELECT COUNT(*) as total FROM tbl_merchant_transaction";

        let result = await query(sql); 

        let totalCount = result[0].total;

        let sql1 = "SELECT COUNT(*) as total FROM tbl_merchant_transaction WHERE status=0";

        let declinedResult = await query(sql1);

            let declinedCount = declinedResult[0].total;

            let percentage = (declinedCount/totalCount)*100;

            percentage = Math.round(percentage);

            return res.json(200,{
                message:`${percentage}% Declined`,
                data: {
                    percentage
                }
            })
        
    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occured",
            error: error
        })      
    }

    
   
} 

module.exports.refund = async function(req,res){

    try {

        let sql = "SELECT COUNT(*) as total FROM tbl_merchant_transaction";

        let result = await query(sql);

            let totalCount = result[0].total;

            let sql1 = "SELECT COUNT(*) as total FROM tbl_merchant_transaction WHERE status=4";

            let refundResult = await query(sql1);

                let refundCount = refundResult[0].total;

                let percentage = (refundCount/totalCount)*100;

                percentage = Math.round(percentage);

                return res.json(200,{
                    message:`${percentage}% Refund`,
                    data: {
                        percentage
                    }
                })
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occured",
            error: error
        })     
        
    }

    
    
} 



