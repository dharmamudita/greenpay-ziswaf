const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { snap } = require('../config/midtrans');
const { authenticateToken } = require('../middleware/auth');

// POST /api/payment/charge - Create a transaction and get Snap Token
router.post('/charge', authenticateToken, async (req, res) => {
  const { amount, program_id, program_name } = req.body;
  const user = req.user;

  if (!amount || !program_id) {
    return res.status(400).json({ error: 'Amount and program_id are required' });
  }

  try {
    // Generate a unique order ID
    const order_id = `ZISWAF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Get user details for customer info
    const userResult = await pool.query("SELECT email, display_name, phone FROM users WHERE id = $1", [user.id]);
    const userData = userResult.rows[0];

    // Create a pending donation record in the database first
    const insertDonation = await pool.query(
      `INSERT INTO donations (user_id, program_id, amount, status, payment_method, notes, order_id) 
       VALUES ($1, $2, $3, 'pending', 'midtrans', $4, $5) RETURNING *`,
      [user.id, program_id, amount, `Midtrans Order ID: ${order_id}`, order_id]
    );

    // Setup Midtrans parameters
    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      item_details: [{
        id: program_id,
        price: amount,
        quantity: 1,
        name: program_name || 'Donasi ZISWAF'
      }],
      customer_details: {
        first_name: userData.display_name,
        email: userData.email,
        phone: userData.phone || '08123456789'
      }
    };

    // Call Midtrans API to get the token
    const transaction = await snap.createTransaction(parameter);
    
    // Return token to the client
    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: order_id
    });
  } catch (error) {
    console.error('Error creating payment charge:', error);
    res.status(500).json({ error: 'Gagal membuat tagihan pembayaran' });
  }
});

// POST /api/payment/webhook - Handle Midtrans notifications
// NOTE: Midtrans webhook doesn't have our authenticateToken, it's server-to-server!
router.post('/webhook', async (req, res) => {
  try {
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

    let newStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        newStatus = 'success';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'success';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = 'failed';
    } else if (transactionStatus == 'pending') {
      newStatus = 'pending';
    }

    // Update donation status in the database
    if (newStatus !== 'pending') {
      const updateResult = await pool.query(
        "UPDATE donations SET status = $1 WHERE order_id = $2 RETURNING program_id, amount, status",
        [newStatus, orderId]
      );
      
      // If payment is successful, also update the collected_amount in ziswaf_programs
      if (newStatus === 'success' && updateResult.rows.length > 0) {
        const donation = updateResult.rows[0];
        
        // Ensure we don't double count if it was already updated
        // In a perfect system, you'd check if the old status was not 'success'
        await pool.query(
          "UPDATE ziswaf_programs SET collected_amount = collected_amount + $1 WHERE id = $2",
          [donation.amount, donation.program_id]
        );
        
        // Update user's total donation, calculate points (Rp 10.000 = 1 GP)
        const getUserIdResult = await pool.query("SELECT user_id FROM donations WHERE order_id = $1", [orderId]);
        if (getUserIdResult.rows.length > 0) {
          const userId = getUserIdResult.rows[0].user_id;
          const pointsEarned = Math.floor(donation.amount / 10000);
          
          await pool.query(
            "UPDATE users SET total_donation = COALESCE(total_donation, 0) + $1, green_points = COALESCE(green_points, 0) + $2 WHERE id = $3",
            [donation.amount, pointsEarned, userId]
          );

          if (pointsEarned > 0) {
            await pool.query(
              `INSERT INTO green_point_history (user_id, points, type, source, description) VALUES ($1, $2, 'earn', 'donation', $3)`,
              [userId, pointsEarned, `Donasi ZISWAF`]
            );
          }
        }
      }
    }

    // Always respond with 200 OK to Midtrans so they stop sending notifications
    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
