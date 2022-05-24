const loginController = require('../modules/login/Controller/loginController');
const dashbordController = require('../modules/login/Controller/dashbordController');
const payoutController = require('../modules/login/Controller/payoutController');
const depositsController = require('../modules/login/Controller/deposits_controller');
const changePassword = require('../modules/login/Controller/changepasswordControlller');
const merchant = require('../modules/login/Controller/merchant');

const route = require("express").Router();
const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, path.join(__dirname,'../images'));
    },
    filename : function(req, file, cb){
        let imgname = new Date().toString();
        imgname = imgname.replace(/ |:|\+|\(|\)/gi, '-');
        let imgext = path.extname(file.originalname);
        let image = `${imgname}${imgext}`;
        cb(null, image);
    }
})
const uploads = multer({ storage: storage });

const helper = require("../helper/jwt");
const username = require("../helper/username");
const dashboardCount = require('../modules/login/Controller/dashbordController');
// const email_validate = require("../helper/email-validation");

const views = (path.join(__dirname , '../views/'));

// routes
route.get('/', (req, res)=>{
    console.log(views);
    res.sendFile(views + 'index.html');
});

route.post('/register', uploads.none(), loginController.register);
route.post('/save-company-profile', uploads.none(),  helper.verify, loginController.company_profile);

route.post('/login', uploads.none(), loginController.login);

// country of incorporation 
route.post('/country-list', uploads.none(), helper.verify, loginController.get_countries);
route.post('/solution-apply', uploads.none(), helper.verify, loginController.get_solution_apply);
route.post('/save-country-solution-apply', uploads.none(), helper.verify, loginController.save_country_solution_apply);
route.post('/save-director-info', uploads.none(), helper.verify, loginController.save_director_info);


//,
// route.post('/user-login', uploads.none(), userController.login);
// route.post('/user-list', uploads.none(), helper.verify, userController.get_users);

route.post('/sqltest', uploads.none(), helper.verify, loginController.testsql);

// dashboard controller

route.post('/payout_icon',uploads.none(),helper.verify, dashbordController.payout_icon);
route.post('/deposits_icon',uploads.none(),helper.verify, dashbordController.deposits_icon);
route.post('/daily_sale_count_icon',uploads.none(),helper.verify, dashbordController.daily_sale_count_icon);

route.post('/dpc_today',uploads.none(),helper.verify, dashbordController.dpc_today);
route.post('/payment_type',uploads.none(),helper.verify, dashbordController.payment_type);

route.post('/top_transaction_today',uploads.none(),helper.verify, dashbordController.top_transaction_today);
route.post('/transaction_overview_month',uploads.none(),helper.verify, dashbordController.transaction_overview_month);

route.post('/success_rate',uploads.none(),helper.verify, dashbordController.success_rate);
route.post('/card_data',uploads.none(),helper.verify, dashbordController.card_data);

/////////////////////


// Payout Controller
route.post('/searchByOrderId',uploads.none(), helper.verify, payoutController.searchByOrderId)
route.post('/date',uploads.none(), helper.verify, payoutController.Date)
route.post('/customDate',uploads.none(), helper.verify, payoutController.customDate)
route.post('/success',uploads.none(), helper.verify, payoutController.success)
route.post('/declined',uploads.none(), helper.verify, payoutController.declined)
route.post('/pending',uploads.none(), helper.verify, payoutController.pending)
route.post('/total',uploads.none(), helper.verify, payoutController.total)
route.post('/viewDetails',uploads.none(), helper.verify, payoutController.viewDetails)
route.post('/downloadReport',uploads.none(), helper.verify, payoutController.downloadReport)
// Check 
route.post('/success_1',uploads.none(), helper.verify, depositsController.success)


// changepassword

route.post('/changePassword',uploads.single('image'), helper.verify, changePassword.changePassword)
// Merchant -- Akonto pay 
route.post('/method1',uploads.single("img1"), helper.verify, merchant.method1)
// route.get('/method1',uploads.single('img1'), helper.verify, merchant.method1)
route.post('/method1',uploads.none(), helper.verify, merchant.method1)




module.exports = route;