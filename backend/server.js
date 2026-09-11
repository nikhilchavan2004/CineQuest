const path = require('path');
const dotenv = require('dotenv');
const { createApp } = require('./src/app');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = createApp();
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
