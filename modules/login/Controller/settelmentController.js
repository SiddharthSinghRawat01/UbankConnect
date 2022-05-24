const mysqlcon = require('../../../config/db_connection');

const settelment = {

 
settelmetnt_Trans: async (req,res)=>{

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

        let sql1 = 'SELECT * FROM tbl_settlement WHERE user_id = ?';
        let result =  await mysqlcon(sql1,user_id)

        // console.log(result[0].requestedAmount)
        let requestedAmount = 0;
        let charges = 0
        let settlementAmount = 0
        for(let i =0; i<result.length; i++){
            requestedAmount += result[i].requestedAmount
            charges += result[i].charges
            settlementAmount += result[i].settlementAmount
        }

        // paginenation
        let total = result.length
        let Page = req.body.page ? Number(req.body.page) : 1
        let page = await pagination(total,Page);

        console.log("total"+total)
        console.log(page)
        // console.log(result)

        let data
        if(!from && !to){
            let sql = 'SELECT * FROM tbl_settlement WHERE user_id = ? AND DATE(created_on) = DATE(NOW()) LIMIT ?,?';
            data = await mysqlcon(sql,[user_id,page.start,page.limit]);
        }else{
            let sql = 'SELECT * FROM tbl_settlement WHERE user_id = ? AND DATE(created_on) >= ? AND DATE(created_on) <= ? LIMIT ?,?';
            data = await mysqlcon(sql,[user_id,from,to,page.start,page.limit]);
        }
        

        console.log(data)



        return res.json(200,{
            message: "settelment transaston",
            data: data,
            "total settel req": requestedAmount,
            charges: charges,
            "amount sent/recived": settlementAmount


        })
        


    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occure",
            error
        });
    }

},


// need to find exchange rate in databse in percentage
requestSettlement : (req,res)=>{
    let user = req.user
    // user.fee_charge  
    let user_id = user.id
    let request = req.body
    let Settlement = {
        settelmentID: request.settelmentId,
        settelmentType: request.settelmentType,
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        walletAdd: request.walletAddress,
        accNo: request.accountNumber,
        bankName: request.bankName,
        branchname: request.branchName,
        city: request.city,
        country: request.country,
        code: request.swiftCode,
        requestedAmmount: request.requestedAmount,
        Charges: request.charges,
        ExchangeRate: request.exchangeRate,
    }

    try {
        

        let sql = "INSERT INTO tbl_settlement SET ? WHERE user_id = ?"


    } catch (error) {
        console.log(error)
        return res.json(500,{
            message: "error occure",
            error
        });
    }

}



}

module.exports = settelment