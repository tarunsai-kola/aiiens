import { SocketProvider } from './context/SocketContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <SocketProvider>
      <AppRouter />
    </SocketProvider>
  );
}

export default App;
