// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TronWeb = require('tronweb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// إعدادات Tron
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: process.env.PRIVATE_KEY
});

// عقد USDT على شبكة TRC20
const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

// دالة السحب
app.post('/withdraw', async (req, res) => {
    try {
        const { toAddress, amount } = req.body;

        if (!tronWeb.isAddress(toAddress)) {
            return res.status(400).json({ error: 'عنوان محفظة غير صالح' });
        }

        if (amount < 250) {
            return res.status(400).json({ error: 'الحد الأدنى للسحب هو 250 USDT' });
        }

        // خصم 2% رسوم
        const finalAmount = amount * 0.98;

        // تحويل إلى وحدة العقد (6 أصفار)
        const sendAmount = Math.floor(finalAmount * 1_000_000);

        const contract = await tronWeb.contract().at(USDT_CONTRACT);

        const tx = await contract.transfer(toAddress, sendAmount).send({
            feeLimit: 100_000_000
        });

        console.log(`تم إرسال ${finalAmount} USDT إلى ${toAddress}`);
        res.json({ success: true, tx });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل عملية السحب' });
    }
});

app.use(express.static(__dirname)); // عرض index.html مباشرة

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
