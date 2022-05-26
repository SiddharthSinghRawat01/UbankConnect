      <?php $settle_merchant_currency = getSettleCurrency(get_merchant_detail()->settle_currency); ?>  <!DOCTYPE html>
<html class="smart-style-6" lang="en-us">
    <head>
        <meta charset="utf-8">
        <!--<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">-->

        <title> UBank Connect <?php   $login_merchant = get_merchant_detail();?> </title>
       
    </head>


<body>

<div class="table-responsive">
    <table border="1" cellspacing="0" cellpadding="10">
        <thead>

            <tr>
            <th colspan="19" class="InvoiceImage" style="text-align: center;"><img src="<?php echo base_url('assets/merchants/img/logo.png'); ?>" style="width: 40%;" /></th>
        </tr>
            <tr class="pdf_border" style="text-align: center;">
                <th colspan="19" class="header pdf_border">Settlement List (<?= 'Merchant: '.$login_merchant->name ?>)</th>
            </tr>
            <tr class="pdf_border">
                <th class="header pdf_border">Sr</th>
                <th class="header pdf_border">Settlement Id</th> 
                <th class="header pdf_border">Settlement Type</th>
                <th class="header pdf_border">From Currency</th>                      
                <th class="header pdf_border">To Currency</th>
                <th class="header pdf_border">Wallet Address</th>
                <th class="header pdf_border">Account Number</th> 
                <th class="header pdf_border">Bank Name</th>
                <th class="header pdf_border">Branch Name</th>                      
                <th class="header pdf_border">City</th>
                <th class="header pdf_border">Country</th>
                <th class="header pdf_border">Swift Code</th>
                <th class="header pdf_border">Requested Amount</th>
                <th class="header pdf_border">Exchange Rate</th>
                <th class="header pdf_border">Charges</th>
                <th class="header pdf_border">Total Charges</th>
                <th class="header pdf_border">Settlement Amount</th>
                <th class="header pdf_border">Status</th>
                <th class="header pdf_border">Created On</th>
            </tr>
        </thead>
        
        <tbody>
            <?php
            if (isset($mobiledata) && !empty($mobiledata)) {
                $i=1;
                foreach ($mobiledata as $invoice_data) {
                    
                    if( $invoice_data->status == '1')
                    {
                        $pay_status = 'Success';
                    }
                    else{
                        $pay_status = 'Failed';
                    }
                    
                    ?>
                    <tr class="pdf_border">
                        <td class="pdf_border"><?php echo $i++; ?></td>   
                        <td class="pdf_border"><?php echo $invoice_data->settlementId; ?></td> 
                        <td class="pdf_border"><?php echo $invoice_data->settlementType; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->fromCurrency; ?></td>                    
                        <td class="pdf_border"><?php echo $invoice_data->toCurrency; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->walletAddress; ?></td>   
                        <td class="pdf_border"><?php echo $invoice_data->accountNumber; ?></td> 
                        <td class="pdf_border"><?php echo $invoice_data->bankName; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->branchName; ?></td>                    
                        <td class="pdf_border"><?php echo $invoice_data->city; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->country; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->swiftCode; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->requestedAmount; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->exchangeRate; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->charges; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->totalCharges; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->settlementAmount; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->status; ?></td>
                        <td class="pdf_border"><?php echo $invoice_data->created_on; ?></td>
                    </tr>
                    <?php
                   
                }
            } else {
                ?>
                <tr>
                    <td colspan="11" class="alert alert-danger">No Records founds</td>    
                </tr>
            <?php } ?>
 
        </tbody>
    </table>
    
</div> 


</body>
</html>

