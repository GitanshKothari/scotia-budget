import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import accountsRoutes from './routes/accountsRoutes';
import categoriesRoutes from './routes/categoriesRoutes';
import budgetsRoutes from './routes/budgetsRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import goalsRoutes from './routes/goalsRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportRoutes from './routes/reportRoutes';
import userRoutes from './routes/userRoutes';
import rulesRoutes from './routes/rulesRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORE_URL = process.env.CORE_URL || 'http://localhost:8080';

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rules', rulesRoutes);

app.listen(PORT, () => {
  console.log(`BFF server running on port ${PORT}`);
  console.log(`Core URL: ${CORE_URL}`);
});

