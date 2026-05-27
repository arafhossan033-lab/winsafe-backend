const express = require('express');
const cors = require('cors');

const app = express();
// রেন্ডার বা যেকোনো ক্লাউড হোস্টিংয়ের জন্য ডাইনামিক পোর্ট সেটআপ
const PORT = process.env.PORT || 5000; 

// মিডলওয়্যার (যাতে ফ্রন্টএন্ডের সাথে ব্যাকএন্ড কোনো বাধা ছাড়া ডেটা আদান-প্রদান করতে পারে)
app.use(cors());
app.use(express.json());

// ডাটাবেজের বিকল্প হিসেবে সাময়িকভাবে মেমোরিতে ডাটা স্টোর রাখা
let fakeUserDatabase = {
    username: "demo_user",
    demoBalance: 20000, // শুরুতে ২০,০০০ ডেমো টাকা
    totalBets: 0,       // মোট কয়টি বাজি ধরেছে
    totalLoss: 0        // মোট কত টাকা হেরেছে
};

// ১. ইউজারের কারেন্ট প্রোফাইল বা ব্যালেন্স দেখার রুট (API Endpoint)
app.get('/api/user-profile', (req, res) => {
    res.json(fakeUserDatabase);
});

// ২. বাজির হিসাব-নিকাশ করার মূল রুট (The Betting Engine)
app.post('/api/place-bet', (req, res) => {
    const { betAmount } = req.body;

    // ইনপুট ভ্যালিডেশন
    if (!betAmount || betAmount <= 0) {
        return res.status(400).json({ error: "সটীক বাজির পরিমাণ দিন!" });
    }

    if (betAmount > fakeUserDatabase.demoBalance) {
        return res.status(400).json({ error: "আপনার ডেমো অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!" });
    }

    // বাজি ধরার সাথে সাথে ইউজারের মোট বাজির সংখ্যা ১ বেড়ে যাবে
    fakeUserDatabase.totalBets += 1;

    let winChance = 0.0; 
    let realityMessage = "";

    // 🧠 মনস্তাত্ত্বিক লজিক (Psychological Algorithm)
    // প্রথম ৩ বার ইউজারকে ইচ্ছাকৃতভাবে জেতানো হবে (আসল জুয়ার ফাঁদ ফিল করানোর জন্য)
    if (fakeUserDatabase.totalBets <= 3) {
        winChance = 0.75; // ৭৫% জেতার চান্স (হানিমুন ফেইজ)
    } 
    // ৪ নম্বর বাজি থেকে জেতার চান্স ড্রপ করে মাত্র ১০% হয়ে যাবে
    else {
        winChance = 0.10; // ১০% জেতার চান্স (রিয়েলিটি ফেইজ)
    }

    // লজিক অনুযায়ী জয়-পরাজয় নির্ধারণ
    const isWin = Math.random() < winChance;

    if (isWin) {
        // জিতলে বাজির টাকার দ্বিগুণ ব্যালেন্সের সাথে যোগ হবে
        const winReward = betAmount * 2;
        fakeUserDatabase.demoBalance += (winReward - betAmount); 
        realityMessage = `🎉 আপনি জিতেছেন! আপনি পেয়েছেন ডেমো ৳${winReward}।`;
    } else {
        // হারলে বাজির টাকা কেটে নেওয়া হবে এবং লসের খাতায় যোগ হবে
        fakeUserDatabase.demoBalance -= betAmount;
        fakeUserDatabase.totalLoss += betAmount;
        realityMessage = `❌ আপনি ডেমো ৳${betAmount} হেরে গেছেন!`;
    }

    // 📢 সচেতনতামূলক মেসেজ (Reality Check)
    if (fakeUserDatabase.totalBets > 3) {
        realityMessage += `\n\n⚠️ রিয়েলিটি চেক: প্রথম ৩ বার আপনি সহজে জিতলেও এখন কেন বারবার হারছেন? কারণ আসল জুয়ার সাইটগুলো এভাবেই শুরুতে লোভ দেখিয়ে পরে সব কেড়ে নেয়। আপনি এ পর্যন্ত মোট ডেমো ৳${fakeUserDatabase.totalLoss.toLocaleString()} হারিয়েছেন! আজই এই ফাঁদ থেকে দূরে থাকুন।`;
    }

    // যদি ব্যালেন্স শূন্য হয়ে যায়, ব্যালেন্স আবার রিফিল করে দেওয়া হবে
    let gameOver = false;
    if (fakeUserDatabase.demoBalance <= 0) {
        fakeUserDatabase.demoBalance = 20000; // রিফিল
        gameOver = true;
    }

    // ফ্রন্টএন্ডের কাছে ফাইনাল রেজাল্ট পাঠানো
    res.json({
        success: true,
        message: realityMessage,
        currentBalance: fakeUserDatabase.demoBalance,
        totalBets: fakeUserDatabase.totalBets,
        gameOver: gameOver
    });
});

// সার্ভার চালু করা
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
          
