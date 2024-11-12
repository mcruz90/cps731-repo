const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// Define routes
app.post('/api/expenses', async (req, res) => {
  const { name, type, confirmation, amount } = req.body;
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ name, type, confirmation, amount }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Expense added successfully', data });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});