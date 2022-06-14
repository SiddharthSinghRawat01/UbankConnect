const mysqlcon = require('../../../config/db_connection');

const Statement  = {

statement: (req,res)=>{
    let user = req.user
    let user_id = user.id

    try {

        let sql = ""
        
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

}

module.exports = Statement;