const mysqlcon = require('../../../config/db_connection');


let pagination = (total,page)=>{
    let limit = 15;

    let numOfPages = Math.ceil(total / limit)
    let start = ((page * limit) - (limit))

    return {limit,start,numOfPages}
}



module.exports.show = async function(req,res){

    let user = req.user;
    
    try {

       
        let sql ="SELECT COUNT(*) as Total FROM tbl_merchant_transaction  where user_id = ?";

        let result  = await mysqlcon(sql,[user.id]);
        
        let total = result[0].Total;
        
        let Page = req.body.page ? Number(req.body.page) : 1;

        let page = pagination(total,Page);

        let sql1 = 'SELECT * FROM tbl_merchant_transaction WHERE user_id = ? LIMIT ?,?'

        
        let result1 = await  mysqlcon(sql1, [user.id, page.start, page.limit]);
        

        
        return res.json(200, {
            message: `All Deposits Transactions are ${total}`,
    
            data: {
                currentPage: Page,
                totalPage: page.numOfPages,
                deposits:result1
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


    let user = req.user;
    try {

        let {orderNumber} = req.body;

        let sql = "SELECT * FROM tbl_merchant_transaction WHERE user_id = ? AND order_no LIKE ?";

        let result = await mysqlcon(sql,[user.id,orderNumber+"%"]);

        if (result.length === 0) {
            res.status(201).json({ message: 'No record found.' });
        } else {
            res.status(200).json({
                message: 'Record for order id ' + orderNumber + ' is ',
                data: result
            })
        }

        
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occurered",
            error: error
        })
        
    }

    

}

module.exports.searchByDate = async function(req,res){

    let user = req.user;

    try {

        let {date} = req.body;

        let sql = "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = ? AND DATE(created_on) = ?";

        let result  = await mysqlcon(sql,[user.id,date]);
        
        let total = result[0].Total;
        let Page = req.body.page ? Number(req.body.page) : 1;

        let page = pagination(total,Page);

        let sql1 = 'SELECT * FROM tbl_merchant_transaction WHERE DATE(created_on) = ? AND user_id = ? LIMIT ?,?'

        
         let result1 = await  mysqlcon(sql1, [date, user.id, page.start, page.limit]);

        if (result1.length === 0) {
                    res.status(201).json({ message: 'No record found.' });
                } else {
                    res.json(200,{
                        message: `Record for Date  ${date} are ${total}`,
                        currentPage: Page,        
                        totalPage: page.numOfPages,
                        message1: 'Showing ' + result1.length + ' out of ' + total + ' results',
                        data: result1
                    })
           }
        
    


        // return res.json(200, {
        //     message: `${result.length} Deposit Transactions for Date ${date}`,
        //     data: {
        //         deposits:output
        //     }

        // });
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occurered",
            error: error
        })
        
    }
  

}

module.exports.searchByDateRange = async function(req,res){

    let user = req.user;
    const { from, to } = req.body;

    try {

        let sql = "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE DATE(created_on) >= ? AND DATE(created_on) <= ? AND user_id = ?"

        let result = await mysqlcon(sql,[from,to,user.id]); 
       
        let total = result[0].Total;
        let Page = req.body.page ? Number(req.body.page) : 1;

        let page = pagination(total,Page);


        let sql1 = 'SELECT * FROM tbl_merchant_transaction WHERE DATE(created_on) >= ? AND DATE(created_on) <= ? AND user_id = ? LIMIT ?,?'
        let result1 = await mysqlcon(sql1, [from, to, user.id,page.start,page.limit])

            if (result1.length === 0) {
                res.status(201).json({ message: 'No record found.' });
            } else {
                res.status(200).json({
                    message: 'Report from ' + from + " to " + to + ' is ',
                    currPage: Page,
                    message1: 'Showing ' + page.limit + ' out of ' + total + ' results',
                    totalPage: page.numOfPages,
                    data: result1
                })
            }

        // return res.json(200, {
        //     message: `${result.length} Deposit Transactions for Date from ${from} to ${to}`,
        //     data: {
        //         deposits:output
        //     }

        // });
   
        
    } catch (error) {

        console.log(error)
        return res.json(500,{
            message: "error occured",
            error: error
        })
        
    }

    

}

module.exports.downloadReports = async function(req,res){


    let user = req.user;
    const { orderNumber } = req.body
    try {
        if (orderNumber != undefined) {
            let sql = 'SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE order_no in (?) AND user_id = ?';
            let result = await mysqlcon(sql, [orderNumber, user.id]);
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
            let sql = 'SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = ?';
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


module.exports.filterRecord = async function(req,res){

    let  user  = req.user;


    try {


        if(req.body.methodPayment === undefined && req.body.status === undefined && req.body.currency === undefined){
            //    return res.redirect('/deposits/show_all');

            let sql ="SELECT COUNT(*) as Total FROM tbl_merchant_transaction where user_id = '"+user.id+"'";
        
        
                let result = await mysqlcon(sql);

                let total = result[0].Total;
                let Page = req.body.page ? Number(req.body.page) : 1;

                let page = pagination(total,Page);

                let sql1 ="SELECT order_no,user_id,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction where user_id = '"+user.id+"' LIMIT ?,?";


                let result1 = await mysqlcon(sql1,[page.start,page.limit]);
                return res.json(200, {
                    message: `All Deposits Transactions are ${total}`,

                    data: {
                        currentPage:Page,
                        totalPage:page.numOfPages,
                        deposits:result1
                    }

                });      
        
            }


        
            let sql;
            
            if(req.body.methodPayment !== undefined){
        
                console.log(req.body.methodPayment.length);
        
        
                if(typeof(req.body.methodPayment) === 'string'){
                    sql="";
                    sql+= "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                    sql+="payment_type = ";
                    sql+="'";
                    sql+=req.body.methodPayment;
                    sql+="'";
                }else{
                    sql="";
                    sql+= "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
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
                        sql+= "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
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
                        sql+= "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
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
                        sql+= "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
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
                        sql+= "SELECT COUNT(*) as Total FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
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
        
            let result2 =  await mysqlcon(sql); 

            let total = result2[0].Total;

            let Page = req.body.page ? Number(req.body.page) : 1;

            let page = pagination(total,Page);


            let sql3;
            
            if(req.body.methodPayment !== undefined){
        
                console.log(req.body.methodPayment.length);
        
        
                if(typeof(req.body.methodPayment) === 'string'){
                    sql3="";
                    sql3+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                    sql3+="payment_type = ";
                    sql3+="'";
                    sql3+=req.body.methodPayment;
                    sql3+="'";
                }else{
                    sql3="";
                    sql3+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                    sql3+="payment_type IN (";
                    for(let i=0; i<req.body.methodPayment.length; i++){
                        sql3+="'"
                        sql3+=req.body.methodPayment[i];
                        sql3+="'"
                        sql3+=',';
                    }
                    sql3 = sql3.slice(0,-1);
                    sql3+=")";
                }
        
              
            }
            
        
            if(req.body.status !== undefined){
        
                if(typeof(req.body.status) === 'string'){
        
                    if(sql3 !== undefined){
                        sql3+= " AND ";
                        sql3+= "status = ";
                        sql3+=req.body.status;
                    
                    }else{
                        sql3="";
                        sql3+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                        sql3+="status = ";
                        sql3+=req.body.status; 
                        
                    }
                }else{
        
                    if(sql3 !== undefined){
                        sql3+= " AND ";
                        sql3+= "status IN (";
                        for(let i=0; i<req.body.status.length; i++){
        
                            sql3+="'";
                            sql3+=req.body.status[i];
                            sql3+="'"
                            sql3+=',';
                        }
                        sql3=sql3.slice(0,-1);
                        sql3+=")"
                       
                    }else{
                        sql3="";
                        sql3+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                        sql3+= "status IN (";
                        for(let i=0; i<req.body.status.length; i++){
        
                            sql3+="'";
                            sql3+=req.body.status[i];
                            sql3+="'"
                            sql3+=',';
                        }
                        sql3=sql3.slice(0,-1);
                        sql3+=")"
        
                    }
        
                    }
        
        
            }
        
        
            if(req.body.currency !== undefined){
        
        
                if(typeof(req.body.currency) === 'string'){
        
                    if(sql3 !== undefined){
                        sql3+= " AND ";
                        sql3+= "ammount_type = ";
                        sql3+="'";
                        sql3+=req.body.currency;
                        sql3+="'";
                    
                    }else{
                        sql3="";
                        sql3+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                        sql3+="ammount_type = ";
                        sql3+="'";
                        sql3+=req.body.currency; 
                        sql3+="'";
                        
                    }
                }else{
        
                    if(sql3 !== undefined){
                        sql3+= " AND ";
                        sql3+= "ammount_type IN (";
                        for(let i=0; i<req.body.currency.length; i++){
        
                            sql3+="'";
                            sql3+=req.body.currency[i];
                            sql3+="'"
                            sql3+=',';
                        }
                        sql3=sql3.slice(0,-1);
                        sql3+=")"
                       
                    }else{
                        sql3="";
                        sql3+= "SELECT order_no,updated_on,i_flname,ammount,ammount_type,payment_type,settle_amount,status FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND ";
                        sql3+= "ammount_type IN (";
                        for(let i=0; i<req.body.currency.length; i++){
        
                            sql3+="'";
                            sql3+=req.body.currency[i];
                            sql3+="'"
                            sql3+=',';
                        }
                        sql3=sql3.slice(0,-1);
                        sql3+=")"
        
                    }
        
                }
        
        
            }

            sql3+=" LIMIT "+page.start+","+page.limit+""
        
            let result3 =  await mysqlcon(sql3); 

            return res.json(200,{
                message: `Total Records are ${total}`,
                currentPage:Page,
                totalPages:page.numOfPages,
                sql3 : sql3,
                data: result3
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

    let user =  req.user;

    try {

     
        let sql = 'SELECT count(status) as count FROM tbl_merchant_transaction WHERE user_id = ?'

        let result =await mysqlcon(sql,[user.id]);
        
        let totalCount = result[0].count;

        let sql1 = "SELECT COUNT(status) as count,SUM(ammount) as ammount FROM tbl_merchant_transaction WHERE user_id = ? AND status=1";
        

        let statusResult = await mysqlcon(sql1,[user.id]);

            let successCount = statusResult[0].count;

            let percentage = (successCount/totalCount)*100;

            percentage = await Math.round(percentage);

            return res.json(200,{
                message:`${percentage}% Success`,
                data: {
                    percentage,
                    amount:statusResult[0].ammount
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

    let user = req.user;

    try {

        let sql = "SELECT COUNT(status) as count FROM tbl_merchant_transaction where user_id = '"+user.id+"'";

        let result = await mysqlcon(sql); 

        let totalCount = result[0].count;

        let sql1 = "SELECT COUNT(status) as count,SUM(ammount) as ammount FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND status=0";

        let declinedResult = await mysqlcon(sql1);

            let declinedCount = declinedResult[0].count;

            let percentage = (declinedCount/totalCount)*100;

            percentage = Math.round(percentage);

            return res.json(200,{
                message:`${percentage}% Declined`,
                data: {
                    percentage,
                    amount:declinedResult[0].ammount
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

    let user = req.user;

    try {

        let sql = "SELECT COUNT(status) as count FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"'";

        let result = await mysqlcon(sql);

            let totalCount = result[0].count;

            let sql1 = "SELECT COUNT(status) as count,SUM(ammount) as ammount FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND status=4";

            let refundResult = await mysqlcon(sql1);

                let refundCount = refundResult[0].count;

                let percentage = (refundCount/totalCount)*100;

                percentage = Math.round(percentage);

                return res.json(200,{
                    message:`${percentage}% Refund`,
                    data: {
                        percentage,
                        amount:refundResult[0].ammount

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


module.exports.chargeback = async function(req,res){

    let user = req.user;

    try {

        let sql = "SELECT COUNT(status) as count FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"'";

        let result = await mysqlcon(sql);

            let totalCount = result[0].count;

            let sql1 = "SELECT COUNT(status) as count,SUM(ammount) as ammount FROM tbl_merchant_transaction WHERE user_id = '"+user.id+"' AND status=5";

            let chargebackResult = await mysqlcon(sql1);

                let chargebackCount = chargebackResult[0].count;

                let percentage = (chargebackCount/totalCount)*100;

                percentage = Math.round(percentage);

                return res.json(200,{
                    message:`${percentage}% Chargeback`,
                    data: {
                        percentage,
                        amount:chargebackResult[0].ammount

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


