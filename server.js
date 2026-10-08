const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('Outsmart Server is running! Ready for Layer 1.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
