const mysqlcon = require('../../../config/db_connection');

const merchantMethods = {
    method1: async (req, res) => {
        //[{"order_id":"4547200306611244","bank":"0","trx_type":"NEFT","payeename":"Pankaj joshi","bnf_nick_name":"panku","amount":"1.00","account_no":"678602010000983 ","ifsc":"UBIN0567868"}]
        var { merchant_no, secretkey, end_point_url, customer_order_id, enc_payout_json, order_id, bank, payeename, bnf_nick_name, amount, account_no, ifsc, trx_type, img1 } = req.body;
        var jsonData = { "order_id": order_id, "bank": bank, "trx_type": trx_type, "payeename": payeename, "bnf_nick_name": bnf_nick_name, "amount": amount, "account_no": amount, "ifsc": ifsc }
        let stringifiedData = JSON.stringify(jsonData)
        var b64 = btoa(stringifiedData);

        console.log(req.body.img1)

        // console.log(b64); 
        // var bin = atob(b64);
        // console.log(bin);


    }


}

module.exports = merchantMethods